from django.db import models

class Locations(models.Model):
    name = models.CharField(max_length=500)
    category = models.CharField(max_length=500,blank=True, null=True)
    description = models.CharField(max_length=300,blank=True, null=True)
    OpeningTime = models.JSONField(blank=True, null=True)
    website_address = models.URLField(blank=True, null=True)
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    zipcode = models.CharField(max_length=200,blank=True, null=True)
    city = models.CharField(max_length=200,blank=True, null=True)
    country = models.CharField(max_length=200,blank=True, null=True)
    address = models.CharField(max_length=200,blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True,blank=True, null=True)
    edited_at = models.DateTimeField(auto_now=True)
    toilet = models.BooleanField(null=True)
    accessibility=models.BooleanField(null=True)
    animals = models.BooleanField(null=True)
    image = models.ImageField(upload_to='static/images/', null=True, blank=True)
    visitTime= models.CharField(max_length=200,blank=True, null=True)
    lat = models.CharField(max_length=200,blank=True, null=True)
    lng = models.CharField(max_length=200,blank=True, null=True)
    place_id = models.CharField(max_length=200,blank=True, null=True)
    icon_image = models.CharField(max_length=200,blank=True, null=True)
    def __str__(self):
        return self.name

class Distances (models.Model):
    from_location = models.ForeignKey(Locations, related_name = 'from_location', on_delete=models.CASCADE)
    to_location = models.ForeignKey(Locations, related_name = 'to_location', on_delete=models.CASCADE)
    mode = models.CharField(max_length=200, blank=True, null=True)
    distance_km = models.DecimalField(max_digits=10, decimal_places=2)
    duration_mins = models.DecimalField(max_digits=10, decimal_places=2)
    duration_traffic_mins = models.DecimalField(max_digits=10, decimal_places=2,blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True,blank=True, null=True)
    edited_at = models.DateTimeField(auto_now=True)
from django.db import models

class TravelPreference(models.Model):
    departure_date = models.DateField()
    departure_time = models.CharField(max_length=5)  # Assuming the format HH:MM AM/PM, e.g., '10:30 AM'
    moving_preference = models.CharField(max_length=20, choices=[
        ('car', 'Car'),
        ('bus', 'Bus'),
        ('train', 'Train'),
        ('plane', 'Plane'),
        ('bike', 'Bike'),
        ('walking', 'Walking'),
        ('other', 'Other')
    ])
    main_interests = models.CharField(max_length=50, choices=[
        ('nature', 'Nature and Outdoor Activities'),
        ('culture', 'Cultural Experiences'),
        ('adventure', 'Adventure Sports'),
        ('food', 'Food and Culinary'),
        ('history', 'Historical Sites'),
        ('shopping', 'Shopping'),
        ('other', 'Other')
    ])

    def __str__(self):
        return f"Travel Preference #{self.id}"
