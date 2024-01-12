import json
import datetime

import livepopulartimes
from django.http import HttpResponse
from django.views.generic import ListView
from django.views import View
from django.shortcuts import render, redirect
from .models import *
import googlemaps
from django.conf import settings
from .forms import *
import requests
from django.http import JsonResponse

class HomeView(ListView):
    template_name = "cagliaritour/home.html"
    context_object_name = 'mydata'
    model = Locations
    success_url = "/"


def get_temperature(city):
    if settings.WEATHER_API_KEY != "":
        url = 'http://api.openweathermap.org/data/2.5/weather?q={}&units=metric&appid=' + settings.WEATHER_API_KEY

        city_weather = requests.get(
            url.format(city)).json()  # request the API data and convert the JSON to Python data types
        json_city_weather = json.dumps(city_weather, separators=(',', ':'), ensure_ascii=True)
        # print(json_city_weather)
        weather = {
            "city": city_weather['name'],
            "temperature": round(city_weather['main']['temp']),
            "humidity": city_weather['main']['humidity'],
            "sunrise": convert_unix_timestamp(city_weather['sys']['sunrise']),
            "sunset": convert_unix_timestamp(city_weather['sys']['sunset']),
            "description": city_weather['weather'][0]['description'],
            "icon": city_weather['weather'][0]['icon'],
            "wind_speed": city_weather['wind']['speed'],
            "wind_direction": city_weather['wind']['deg'],

        }

        return weather


def convert_unix_timestamp(unix_timestamp):
    # Convert Unix timestamp to datetime object
    dt_object = datetime.datetime.fromtimestamp(unix_timestamp)

    # Convert datetime object to human-readable format
    human_readable_time = dt_object.strftime('%H:%M:%S')

    return human_readable_time

# A class to get Information about different markers stored in database
class MapView(View):
    template_name = "cagliaritour/map.html"

    def get(self, request):
        key = settings.GOOGLE_MAP_API_KEY
        eligable_locations = Locations.objects.all()
        locations = []
        form = TravelPreferenceForm
        for a in eligable_locations:
            if not a.place_id:  # Check if place_id is empty
                # If place_id is empty, get it using get_place_id function
                a.place_id = get_place_id(a.lat, a.lng)
                a.save()  # Save the updated place_id to the database

            data = {
                "lat": float(a.lat),
                "lng": float(a.lng),
                "name": a.name,
                "icon": a.icon_image,
                "description": a.description,
                "image": a.image.url if a.image else '/static/images/museum.png',
                "placeId": a.place_id,

            }

            locations.append(data)
        json_locations = json.dumps(locations, separators=(',', ':'), ensure_ascii=True)
        weather_data = json.dumps(get_temperature("Cagliari"), separators=(',', ':'), ensure_ascii=True)
        # print(json_locations)
        context = {
            "key": key,
            "locations": json_locations,
            "form": form,
            "weather": weather_data
        }

        return render(request, self.template_name, context)


class DistanceView(View):
    template_name = "cagliaritour/distance.html"

    def get(self, request):
        form = DistanceForm
        distances = Distances.objects.all()
        context = {
            'form': form,
            'distances': distances
        }

        return render(request, self.template_name, context)

    def post(self, request):
        form = DistanceForm(request.POST)
        if form.is_valid():
            from_location = form.cleaned_data['from_location']
            from_location_info = Locations.objects.get(name=from_location)
            from_adress_string = str(from_location_info.adress) + ", " + str(from_location_info.zipcode) + ", " + str(
                from_location_info.city) + ", " + str(from_location_info.country)

            to_location = form.cleaned_data['to_location']
            to_location_info = Locations.objects.get(name=to_location)
            to_adress_string = str(to_location_info.adress) + ", " + str(to_location_info.zipcode) + ", " + str(
                to_location_info.city) + ", " + str(to_location_info.country)

            mode = form.cleaned_data['mode']
            now = datetime.now()

            gmaps = googlemaps.Client(key=settings.GOOGLE_MAP_API_KEY)
            calculate = gmaps.distance_matrix(
                from_adress_string,
                to_adress_string,
                mode=mode,
                departure_time=now
            )

            duration_seconds = calculate['rows'][0]['elements'][0]['duration']['value']
            duration_minutes = duration_seconds / 60

            distance_meters = calculate['rows'][0]['elements'][0]['distance']['value']
            distance_kilometers = distance_meters / 1000

            if 'duration_in_traffic' in calculate['rows'][0]['elements'][0]:
                duration_in_traffic_seconds = calculate['rows'][0]['elements'][0]['duration_in_traffic']['value']
                duration_in_traffic_minutes = duration_in_traffic_seconds / 60
            else:
                duration_in_traffic_minutes = None

            obj = Distances(
                from_location=Locations.objects.get(name=from_location),
                to_location=Locations.objects.get(name=to_location),
                mode=mode,
                distance_km=distance_kilometers,
                duration_mins=duration_minutes,
                duration_traffic_mins=duration_in_traffic_minutes
            )

            obj.save()

        else:
            print(form.errors)

        return redirect('my_distance_view')


class GeocodingView(View):
    template_name = "cagliaritour/geocoding.html"

    def get(self, request, pk):
        location = Locations.objects.get(pk=pk)

        if location.lng and location.lat and location.place_id != None:
            lat = location.lat
            lng = location.lng
            place_id = location.place_id
            label = "from my database"

        elif location.adress and location.country and location.zipcode and location.city != None:
            adress_string = str(location.adress) + ", " + str(location.zipcode) + ", " + str(
                location.city) + ", " + str(location.country)

            gmaps = googlemaps.Client(key=settings.GOOGLE_MAP_API_KEY)
            result = gmaps.geocode(adress_string)[0]

            lat = result.get('geometry', {}).get('location', {}).get('lat', None)
            lng = result.get('geometry', {}).get('location', {}).get('lng', None)
            place_id = result.get('place_id', {})
            label = "from my api call"

            location.lat = lat
            location.lng = lng
            location.place_id = place_id
            location.save()

        else:
            result = ""
            lat = ""
            lng = ""
            place_id = ""
            label = "no call made"

        context = {
            'location': location,
            'lat': lat,
            'lng': lng,
            'place_id': place_id,
            'label': label
        }

        return render(request, self.template_name, context)







def get_popular_times(request, place_id):
    try:
        # Assuming you have a function to retrieve popular times by place ID
        popular_times_data = livepopulartimes.get_populartimes_by_PlaceID(settings.GOOGLE_MAP_API_KEY, "ChIJtW0qSJp0hlQRj22fXuPh7s4")
        json_places = json.dumps(popular_times_data['populartimes'], separators=(',', ':'), ensure_ascii=True)
        return JsonResponse({'data': json_places})
    except Exception as e:
        return JsonResponse({'error': str(e)})

# def get_popular_times():
#     popular_times_data = livepopulartimes.get_populartimes_by_PlaceID(settings.GOOGLE_MAP_API_KEY,
#                                                                       "ChIJtW0qSJp0hlQRj22fXuPh7s4")
#     popular_times_data = popular_times_data['populartimes']
#     json_places = json.dumps(popular_times_data, separators=(',', ':'), ensure_ascii=True)
#     return json_places

def calculate_route(request):
    json_response = {
        "guide": [
            {
                "day": "14/08/2023",
                "POIs": [
                    "Cagliari Port",
                    "Museo Archeologico",
                    "Teatro Romano",
                    "Santuario di Bonaria",
                    "Basilica S. Saturnino",
                    "Marina di Bonaria"
                ],
                "visitTime": [
                    "08:30-09:00",
                    "09:30-11:30",
                    "12:00-12:30",
                    "15:00-15:30",
                    "16:00-16:30",
                    "17:00-18:00"
                ]
            },
            {
                "day": "15/08/2023",
                "POIs": [
                    "Bastione Saint Remy",
                    "Teatro Lirico",
                    "Necropoli Tuvixeddu",
                    "Parco di Monteclaro",
                    "Cagliari Port",
                    "Museo Archeologico",
                    "Teatro Romano",
                    "Santuario di Bonaria",
                    "Basilica S. Saturnino",
                    "Marina di Bonaria"
                ],
                "visitTime": [
                    "08:30-09:30",
                    "10:30-12:00",
                    "15:00-17:30",
                    "18:30-19:30"
                ]
            },
            {
                "day": "16/08/2023",
                "POIs": [
                    "Parco Monte Urpinu",
                    "Poetto Beach",
                    "Sella del Diavolo",
                    "Cagliari Port"
                ],
                "visitTime": [
                    "09:00-09:30",
                    "11:00-16:00",
                    "17:00-19:00",
                    "20:00-20:30"
                ]
            }
        ]
    }
    return JsonResponse(json_response)

# Function to get Place Id that will be used to retrieve popular times graph
def get_place_id(latitude, longitude):
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'latlng': f"{latitude},{longitude}",
        'key': settings.GOOGLE_MAP_API_KEY,
    }

    try:
        response = requests.get(base_url, params=params)
        data = response.json()

        if response.status_code == 200 and data.get('status') == 'OK':
            place_id = data['results'][0]['place_id']
            return place_id
        else:
            print(f"Error: {data['status']} - {data.get('error_message', 'No error message')}")
    except Exception as e:
        print(f"Error making API request: {e}")