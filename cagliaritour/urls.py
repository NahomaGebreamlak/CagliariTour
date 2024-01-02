from django.urls import path
from .views import *

urlpatterns = [
    path("homeview", HomeView.as_view(), name='my_home_view'),
    path("geocoding/<int:pk>", GeocodingView.as_view(), name='my_geocoding_view'),
    path("distance", DistanceView.as_view(), name='my_distance_view'),
    path("", MapView.as_view(), name='my_map_view'),
    path("crowd_level_barchart/<str:latitude>/<str:longitude>/", crowd_level_barchart, name='crowd_level_show'),
    path('popular_times/', get_popular_times, name='popular_times'),
    path('getroute/', calculate_route, name='getroute'),

]