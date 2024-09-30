import json
import datetime

import livepopulartimes
from django.http import HttpResponse
from django.views.generic import ListView
from django.views import View
from django.shortcuts import render, redirect

from .viewsclass.populartimes import get_place_id
from .viewsclass.weatherview import get_temperature
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


# A class to get Information about different markers stored in database
class MapView(View):
    template_name = "cagliaritour/map.html"

    def get(self, request):
        key = settings.GOOGLE_MAP_API_KEY
        eligable_locations = Place.objects.all()
        locations = []
        form = TravelPreferenceForm
        for a in eligable_locations:
            lat = a.Location.split(',')[0]
            lng = a.Location.split(',')[1]
            # print(lat +"--------#########-----" +lng + "/static/icons/" + a.Icon)
            if not a.place_id:  # Check if place_id is empty
                # If place_id is empty, get it using get_place_id function
                a.place_id = get_place_id(lat, lng)
                a.save()  # Save the updated place_id to the database

            data = {
                "lat": float(lat),
                "lng": float(lng),
                "name": a.Name,
                "icon": "static/icons/" + a.Icon,
                "description": a.Description,
                "image": "/static/images/" + a.Image if a.Image else '/static/images/museum.png',
                "placeId": a.place_id,

            }

            locations.append(data)
        json_locations = json.dumps(locations, separators=(',', ':'), ensure_ascii=True)
        weather_data = json.dumps(get_temperature("Cagliari"), separators=(',', ':'), ensure_ascii=True)

        context = {
            "key": key,
            "locations": json_locations,
            "form": form,
            "weather": weather_data
        }

        return render(request, self.template_name, context)


import os
import googlemaps
from django.shortcuts import render, redirect
from django.contrib import messages
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from .models import Place

import googlemaps


import requests

import requests
def fetch_place_details(api_key, place_id):

    # List of fields to request. Add as many fields as you need.
    fields = ','.join([
        'address_component',
        'adr_address',
        'business_status',
        'formatted_address',
        'geometry',
        'icon',
        'name',
        'permanently_closed',
        'photo',
        'place_id',
        'plus_code',
        'type',
        'url',
        'utc_offset',
        'vicinity',
        'formatted_phone_number',
        'international_phone_number',
        'opening_hours',
        'website',
        'price_level',
        'rating',
        'review',
        'user_ratings_total',
        'wheelchair_accessible_entrance'
    ])

    # Construct the URL with fields, place_id, and API key
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        'fields': fields,
        'place_id': place_id,
        'key': api_key
    }

    # Print the constructed URL and parameters for debugging
    print("Constructed URL:")
    print(url)
    print("Request Parameters:")
    print(params)

    # Perform the GET request
    response = requests.get(url, params=params)

    # Print the full URL for debugging
    print("Full Request URL:")
    print(response.url)

    # Check for successful response
    if response.status_code == 200:
        place_details = response.json().get('result', {})
        # Print the entire response for debugging
        print("Fetched Place Details:")
        print(place_details)
        return place_details
    else:
        # Print error details
        print(f"Error fetching place details: {response.status_code}")
        print(response.text)
        return None



def analyze_comments(comments):
    analyzer = SentimentIntensityAnalyzer()
    positive_comments = 0
    negative_comments = 0

    for comment in comments:
        sentiment = analyzer.polarity_scores(comment)
        if sentiment['compound'] >= 0.05:
            positive_comments += 1
        elif sentiment['compound'] <= -0.05:
            negative_comments += 1

    return positive_comments, negative_comments


def update_place_details(request):
    api_key = settings.GOOGLE_MAP_API_KEY

    # Fetch the first 3 places where place_id is not null
    places = Place.objects.filter(place_id__isnull=False).all()[2:5]

    for place in places:
        details = fetch_place_details(api_key, place.place_id)
        if details:
            place.average_rating = float(details.get('rating', 0.0))
            place.user_rating_accessibility = float(details.get('user_ratings_total', 0))

            reviews = details.get('reviews', [])
            comments = [review['text'] for review in reviews]

            positive_comments, negative_comments = analyze_comments(comments)
            place.num_positive_comments = positive_comments
            place.num_negative_comments = negative_comments

            # Check and update wheelchair accessible entrance information
            accessibility_info = details.get('wheelchair_accessible_entrance', None)
            if accessibility_info is not None:
                place.wheelchair_accessible_entrance = accessibility_info

            place.save()
            print(f"Updated place: {place.average_rating} - {place.name}")
        else:
            print(f"Details not found for place ID: {place.place_id}")

    messages.success(request, 'Place details updated successfully!')
    return redirect('place_list')

def show_update_page(request):
    return render(request, 'cagliaritour/update_place.html')

def place_list(request):
    places = Place.objects.all()  # Retrieve all places
    return render(request, 'cagliaritour/place_list.html', {'places': places})

from deepface import DeepFace
import cv2
import numpy as np
import base64
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def face_detection(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            image_data = data.get('image')

            # Decode the base64 image
            if image_data:
                image_data = image_data.split(',')[1]  # Remove the base64 header
                image_bytes = base64.b64decode(image_data)
                image_array = np.frombuffer(image_bytes, np.uint8)
                image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

                # Perform face analysis using DeepFace
                try:
                    analysis_result = DeepFace.analyze(image, actions=['age', 'gender', 'race', 'emotion'], detector_backend='mtcnn', enforce_detection=False)

                    # You can access detected faces and bounding boxes here
                    for face in analysis_result['instances']:
                        x, y, w, h = face['region']['x'], face['region']['y'], face['region']['w'], face['region']['h']
                        cv2.rectangle(image, (x, y), (x + w, y + h), (255, 0, 0), 2)

                    # Encode the processed image back to base64
                    _, buffer = cv2.imencode('.jpg', image)
                    processed_image_base64 = base64.b64encode(buffer).decode('utf-8')

                    return JsonResponse({"success": True, "processed_image": processed_image_base64, "analysis": analysis_result})

                except Exception as e:
                    logger.error(f"Error during face detection: {str(e)}")
                    return JsonResponse({"success": False, "error": str(e)})
            else:
                logger.error("No image data found")
                return JsonResponse({"success": False, "error": "No image data found"})

        except json.JSONDecodeError:
            logger.error("JSON decode error")
            return JsonResponse({"success": False, "error": "Invalid JSON format"})

        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            return JsonResponse({"success": False, "error": str(e)})

    logger.warning("Invalid request method")
    return JsonResponse({"success": False, "error": "Invalid request method"})
