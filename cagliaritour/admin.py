from django.contrib import admin

from .models import *

admin.site.register(Locations)
admin.site.register(Distances)
admin.site.register(TravelPreference)