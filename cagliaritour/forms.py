from django import forms
from django.forms import ModelForm
from .models import *

modes = (
    ("driving", "driving"),
    ("walking", "walking"),
    ("bicycling", "bicycling"),
    ("transit", "transit")
)

class DistanceForm(ModelForm):
    from_location = forms.ModelChoiceField(label="Location from", required=True, queryset=Locations.objects.all())
    to_location = forms.ModelChoiceField(label="Location to", required=True, queryset=Locations.objects.all())
    mode = forms.ChoiceField(choices=modes, required=True)
    class Meta:
        model = Distances
        exclude = ['created_at', 'edited_at', 'distance_km','duration_mins','duration_traffic_mins']




class TravelPreferenceForm(forms.Form):
    DEPARTURE_CHOICES = [(str(hour), f"{hour}:00 AM") for hour in range(1, 13)] + [(str(hour), f"{hour}:00 PM") for hour
                                                                                   in range(1, 13)]
    DEPARTURE_CHOICES += [('0', '12:00 AM'), ('12', '12:00 PM')]

    departure_date = forms.DateField(
        widget=forms.TextInput(attrs={'type': 'date'}),
        label="What is your departure day?"
    )
    departure_time = forms.ChoiceField(
        choices=DEPARTURE_CHOICES,
        widget=forms.Select,
        label="What is your departure time?"
    )

    MOVING_CHOICES = [
        ('car', 'Car'),
        ('bus', 'Bus'),
        ('train', 'Train'),
        ('plane', 'Plane'),
        ('bike', 'Bike'),
        ('walking', 'Walking'),
        ('other', 'Other')
    ]
    moving_preference = forms.ChoiceField(
        choices=MOVING_CHOICES,
        widget=forms.Select,
        label="How do you mainly prefer moving around?"
    )

    INTEREST_CHOICES = [
        ('nature', 'Nature and Outdoor Activities'),
        ('culture', 'Cultural Experiences'),
        ('adventure', 'Adventure Sports'),
        ('food', 'Food and Culinary'),
        ('history', 'Historical Sites'),
        ('shopping', 'Shopping'),
        ('other', 'Other')
    ]
    main_interests = forms.ChoiceField(
        choices=INTEREST_CHOICES,
        widget=forms.SelectMultiple(attrs={'class': 'form-control'}),
        label="What are your main interests?"
    )
