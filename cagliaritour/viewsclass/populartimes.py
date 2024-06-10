import livepopulartimes
from django.http import JsonResponse
import json
from django.conf import settings
import requests


def get_popular_times(request, place_id):
    try:
        # Retrieve popular times by place ID
        popular_times_data = livepopulartimes.get_populartimes_by_PlaceID(settings.GOOGLE_MAP_API_KEY, place_id)
        print("Place ID ...." + place_id)

        if 'populartimes' in popular_times_data and popular_times_data['populartimes']:
            json_places = json.dumps(popular_times_data['populartimes'], separators=(',', ':'), ensure_ascii=True)
            return JsonResponse({'data': json_places})
        else:
            return JsonResponse({})
    except Exception as e:
        return JsonResponse({'error': str(e)})


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