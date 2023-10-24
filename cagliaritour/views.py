import json
import datetime

from django.http import HttpResponse
from django.views.generic import ListView
from django.views import View
from django.shortcuts import render, redirect
from .models import *
import googlemaps
from django.conf import settings
from .forms import *
import requests

class HomeView(ListView):
    template_name = "cagliaritour/home.html"
    context_object_name = 'mydata'
    model = Locations
    success_url = "/"


def get_temperature(city):
    print(city)
    url = 'http://api.openweathermap.org/data/2.5/weather?q={}&units=metric&appid=' + settings.WEATHER_API_KEY

    city_weather = requests.get(url.format(city)).json()  # request the API data and convert the JSON to Python data types
    json_city_weather = json.dumps(city_weather, separators=(',', ':'), ensure_ascii=True)
    # print(json_city_weather)
    weather = {
        "city": city_weather['name'],
        "temperature": round(city_weather['main']['temp']),
        "humidity":city_weather['main']['humidity'],
        "sunrise":convert_unix_timestamp(city_weather['sys']['sunrise']),
        "sunset": convert_unix_timestamp(city_weather['sys']['sunset']),
        "description": city_weather['weather'][0]['description'],
        "icon": city_weather['weather'][0]['icon'],
        "wind_speed":city_weather['wind']['speed'],
        "wind_direction": city_weather['wind']['deg'],

    }

    return weather


def convert_unix_timestamp(unix_timestamp):
    # Convert Unix timestamp to datetime object
    dt_object = datetime.datetime.fromtimestamp(unix_timestamp)

    # Convert datetime object to human-readable format
    human_readable_time = dt_object.strftime('%H:%M:%S')

    return human_readable_time
class MapView(View):
    template_name = "cagliaritour/map.html"

    def get(self, request):
        key = settings.GOOGLE_MAP_API_KEY
        eligable_locations = Locations.objects.filter(place_id__isnull=False)
        locations = []
        form = TravelPreferenceForm
        for a in eligable_locations:
            data = {
                "lat": float(a.lat),
                "lng": float(a.lng),
                "name": a.name

            }

            locations.append(data)
        json_locations = json.dumps(locations, separators=(',', ':'),ensure_ascii=True)

        # print(json_locations)
        context = {
            "key": key,
            "locations": json_locations,
            "form": form,
            "weather": get_temperature("Cagliari")
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


def get_average_crowd_level(api_key, place_id):
    url = f"https://maps.googleapis.com/maps/api/place/details/json?placeid={place_id}&key={api_key}"
    response = requests.get(url)
    data = response.json()
    print(data)

    return data
def crowd_level_view(request):
    api_key = settings.GOOGLE_MAP_API_KEY
    place_id = "ChIJ_-a_NJsz5xIR56i_kxzifnE"

    crowd_level = get_average_crowd_level(api_key, place_id)

    # Prepare data to pass to the template
    crowd_level_data = [
        ['Time', 'Crowd Level'],
        ['8:00 AM', 50],
        ['9:00 AM', 70],
        ['10:00 AM', 85],
        ['11:00 AM', 60],
        ['12:00 PM', 75]
        # Add more data points as needed
    ]

    # Render the HTML template with crowd level data
    return render(request, 'cagliaritour/crowd_level.html', {'crowd_level_data': crowd_level_data})

def crowd_level_barchart(request):
  latitude = request.GET.get('latitude')
  longitude = request.GET.get('longitude')

  # Create a Google Maps client
  gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)

  # Get the crowd level at the specified location
  crowd_level = gmaps.places_nearby(location=(latitude, longitude), radius=500, type='restaurant')['results'][0]['place_data']['business_status']

  # Generate a barchart data set
  crowd_level_chart_data = {
    'labels': ['Very low', 'Low', 'Medium', 'High', 'Very high'],
    'datasets': [{
      'data': [0, 0, 0, 0, 0],
      'backgroundColor': ['#008000', '#FFFF00', '#FFA500', '#FF0000', '#800000']
    }]
  }

  # Set the crowd level data point
  crowd_level_chart_data['datasets'][0]['data'][crowd_level] = 1

  # Return the barchart data as a JSON object
  return HttpResponse(json.dumps(crowd_level_chart_data), content_type='application/json')