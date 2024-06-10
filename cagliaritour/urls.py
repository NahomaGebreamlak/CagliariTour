from django.urls import path
from .views import *
from .viewsclass.routecalculator import calculate_route
from .viewsclass.populartimes import get_popular_times
urlpatterns = [
    path("homeview", HomeView.as_view(), name='my_home_view'),
    path("", MapView.as_view(), name='my_map_view'),
    path('popular_times/<str:place_id>/', get_popular_times, name='popular_times'),
    path('getroute/<str:numberofdays>/', calculate_route, name='getroute'),

]