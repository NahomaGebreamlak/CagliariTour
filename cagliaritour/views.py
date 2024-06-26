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

