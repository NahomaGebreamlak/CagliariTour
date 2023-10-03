from django.shortcuts import render
import requests
from .models import City
from .forms import CityForm
from django.conf import settings
def index(request):

    url = 'http://api.openweathermap.org/data/2.5/weather?q={}&units=metric&appid='+settings.WEATHER_API_KEY
    form = CityForm()
    if request.method == 'POST':  # only true if form is submitted
        form = CityForm(request.POST)  # add actual request data to form for processing
        form.save()  # will validate and save if validate
    cities = City.objects.all()
    weather_data = []
    for city in cities:
        city_weather = requests.get(
            url.format(city)).json()  # request the API data and convert the JSON to Python data types

        weather = {
            'city': city,
            'temperature': city_weather['main']['temp'],
            'description': city_weather['weather'][0]['description'],
            'icon': city_weather['weather'][0]['icon']
        }
        weather_data.append(weather)

    return render(request, 'weather/index.html', {'weather_data': weather_data, 'form': form})