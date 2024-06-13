from django.http import JsonResponse
import json
import datetime
from random import sample, shuffle
from ..models import Place
#
# def calculate_route(request):
#     json_response = {
#         "guide": [
#             {
#                 "day": "14/08/2023",
#                 "POIs": [
#                     "Cagliari Port",
#                     "Museo Archeologico",
#                     "Teatro Romano",
#                     "Santuario di Bonaria",
#                     "Basilica S. Saturnino",
#                     "Marina di Bonaria"
#                 ],
#                 "visitTime": [
#                     "08:30-09:00",
#                     "09:30-11:30",
#                     "12:00-12:30",
#                     "15:00-15:30",
#                     "16:00-16:30",
#                     "17:00-18:00"
#                 ]
#             },
#             {
#                 "day": "15/08/2023",
#                 "POIs": [
#                     "Bastione Saint Remy",
#                     "Teatro Lirico",
#                     "Necropoli Tuvixeddu",
#                     "Parco di Monteclaro",
#                     "Cagliari Port",
#                     "Museo Archeologico",
#                     "Teatro Romano",
#                     "Santuario di Bonaria",
#                     "Basilica S. Saturnino",
#                     "Marina di Bonaria"
#                 ],
#                 "visitTime": [
#                     "08:30-09:30",
#                     "10:30-12:00",
#                     "15:00-17:30",
#                     "18:30-19:30"
#                 ]
#             },
#             {
#                 "day": "16/08/2023",
#                 "POIs": [
#                     "Parco Monte Urpinu",
#                     "Poetto Beach",
#                     "Sella del Diavolo",
#                     "Cagliari Port"
#                 ],
#                 "visitTime": [
#                     "09:00-09:30",
#                     "11:00-16:00",
#                     "17:00-19:00",
#                     "20:00-20:30"
#                 ]
#             }
#         ]
#     }
#     return JsonResponse(json_response)
#


import json
import datetime
from random import sample, shuffle
from django.http import JsonResponse



def calculate_route(request,numberofdays):
    # Assuming places_data is a queryset containing Place objects from your Django model
    places_data = list(Place.objects.all())
    num_days = 7

    # print("................ Number of Days"+ numberofdays)
    # Create empty lists to store the generated main itinerary and optional itinerary
    main_itinerary = []
    optional_itinerary = []

    # Loop through each day
    for i in range(num_days):
        # Create dictionaries to represent each day in the main and optional itineraries
        main_day_itinerary = {
            "day": (datetime.date.today() + datetime.timedelta(days=i)).strftime('%d/%m/%Y'),
            "POIs": [],
            "visitTime": []
        }
        optional_day_itinerary = {
            "day": (datetime.date.today() + datetime.timedelta(days=i)).strftime('%d/%m/%Y'),
            "POIs": [],
            "visitTime": []
        }

        # a set to keep track of already selected places for both main and optional itineraries
        selected_main_places = set()
        selected_optional_places = set()

        #  hours in a day
        hours_in_day = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

        # Shuffle the places_data list to add randomness
        shuffle(places_data)

        # Iterate through each hour
        for hour in hours_in_day:
            # Randomly select a place for the main list
            selected_place_main = sample(places_data, 1)[0]

            # Ensure no repetition of places in the day's main itinerary
            if selected_place_main not in selected_main_places:
                selected_main_places.add(selected_place_main)
                main_day_itinerary["POIs"].append(selected_place_main.Name)
                main_day_itinerary["visitTime"].append(hour)

            # Randomly select a place for the optional list
            selected_place_optional = sample(places_data, 1)[0]
            # Ensure the place is not already selected for the main list
            if selected_place_optional not in selected_optional_places:
                selected_optional_places.add(selected_place_optional)
                optional_day_itinerary["POIs"].append(selected_place_optional.Name)
                optional_day_itinerary["visitTime"].append(hour)

        # Append the day's main and optional itineraries to their respective lists
        main_itinerary.append(main_day_itinerary)
        optional_itinerary.append(optional_day_itinerary)

    # Return the main and optional itineraries as a JSON response
    return JsonResponse({"guide": main_itinerary, "optional_guide": optional_itinerary})
