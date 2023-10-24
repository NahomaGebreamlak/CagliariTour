# qiwj gehm ttbh rmje ---- gmail account password

# urls.py
from django.urls import path
from .views import *

urlpatterns = [
    path("", BasicEmailView.as_view(), name='my_form_view'),
    path("showemail", showEmail, name='show_email'),
    path('add', trip_form, name='trip_form'),
]