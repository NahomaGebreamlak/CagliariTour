import json
import datetime

from django.conf import settings
import requests

def get_temperature(city):
    if settings.WEATHER_API_KEY != "":
        url = 'http://api.openweathermap.org/data/2.5/weather?q={}&units=metric&appid=' + settings.WEATHER_API_KEY

        city_weather = requests.get(
            url.format(city)).json()  # request the API data and convert the JSON to Python data types
        json_city_weather = json.dumps(city_weather, separators=(',', ':'), ensure_ascii=True)
        # print(json_city_weather)
        weather = {
            "city": city_weather['name'],
            "temperature": round(city_weather['main']['temp']),
            "humidity": city_weather['main']['humidity'],
            "sunrise": convert_unix_timestamp(city_weather['sys']['sunrise']),
            "sunset": convert_unix_timestamp(city_weather['sys']['sunset']),
            "description": city_weather['weather'][0]['description'],
            "icon": city_weather['weather'][0]['icon'],
            "wind_speed": city_weather['wind']['speed'],
            "wind_direction": city_weather['wind']['deg'],

        }

        return weather
def convert_unix_timestamp(unix_timestamp):
    # Convert Unix timestamp to datetime object
    dt_object = datetime.datetime.fromtimestamp(unix_timestamp)

    # Convert datetime object to human-readable format
    human_readable_time = dt_object.strftime('%H:%M:%S')

    return human_readable_time