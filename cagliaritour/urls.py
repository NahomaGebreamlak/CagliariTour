from django.urls import path
from .views import *
from .viewsclass.faceprediction import analyze_image
from .viewsclass.routecalculator import calculate_route, feedback_route, print_unique_categories, get_route_and_graph
from .viewsclass.populartimes import get_popular_times
urlpatterns = [
    path("homeview", HomeView.as_view(), name='my_home_view'),
    path("", MapView.as_view(), name='my_map_view'),
    path('popular_times/<str:place_id>/', get_popular_times, name='popular_times'),
    path('getroute/<str:numberofdays>/', calculate_route, name='getroute'),
    path('update-place-details/', update_place_details, name='update_place_details'),
    path('update-place/', show_update_page, name='show_update_page'),
    path('place-list/', place_list, name='place_list'),
    path('face_detection/', face_detection, name='face_detection'),
    path('analyze_image/', analyze_image, name='analyze_image'),
    path('feedback/', feedback_route, name='feedback'),
    path('unique-categories/', print_unique_categories, name='unique_categories'),
    path('getroutegraph/<int:numberofdays>/', get_route_and_graph, name='get_route_and_graph'),

]