from django.shortcuts import render
import requests
from .forms import EmailForm
from .models import Emails, Trip
from django.views.generic import ListView, FormView
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth.models import User
from django.conf import settings
from xhtml2pdf import pisa
from io import BytesIO
from django.template.loader import get_template
from django.shortcuts import render, redirect
from .forms import TripForm

from urllib.parse import urlencode


def showEmail(request):
    template_name = "sendemail/email.html"
    return render(request, template_name)


class BasicEmailView(FormView, ListView):
    template_name = "sendemail/home.html"
    context_object_name = 'mydata'
    model = Emails
    form_class = EmailForm
    success_url = "/"

    def form_valid(self, form):
        my_subject = "Your Trip Details and Google Maps Link"
        my_recipient = form.cleaned_data['email']

        if User.objects.filter(email=my_recipient).exists():
            user = User.objects.get(email=my_recipient)
            welcome_message = "Welcome " + user.first_name + " " + user.last_name + "!"
        else:
            welcome_message = "You have been invited to use our app!"

        link_app = "http://localhost:8000"
        # Google Static Maps API endpoint
        api_endpoint = "https://maps.googleapis.com/maps/api/staticmap"

        # Parameters for the static map (latitude, longitude, zoom level, etc.)
        params = {
            # 'center': 'Cagliari,CA',  # Replace with your desired coordinates
            'zoom': 14,  # Adjust the zoom level as needed
            'size': '500x500',  # Size of the static map image
            "markers": "color:blue|label:S|39.214986,9.111492",
            "markers": "icon:https://tinyurl.com/jrhlvu6|39.216121,9.108279",
            "maptype": "roadmap",
            "path": "color:0xff0000|weight:5|39.215388,9.110771|39.243137,9.104331",
            'key': settings.GOOGLE_MAP_API_KEY

        }

        encoded_params = urlencode(params)
        url = f"{api_endpoint}?{encoded_params}"
        print(url)
        # Send GET request to Google Static Maps API
        response = requests.get(url)
        print(response.status_code)

        # Save the response content (PNG image) locally
        with open('static/downloads/static_map_nahom2.png', 'wb') as f:
            f.write(response.content)

        print(my_recipient)
        # Get the HTML template content
        html_template = get_template("sendemail/email.html")
        google_link = google_maps_link("Cagliari","Sasari")
        trips = Trip.objects.all()
        context = {'google_maps_url': google_link,
                   'img_name': "static_map_nahom2.png",
                   'trips': trips
                   }  # Add context data if needed
        html_content = html_template.render(context)
        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_buffer)
        pdf_file_path = "static/downloads/output2New.pdf"

        if not pisa_status.err:
            # PDF conversion successful, save the PDF to a file
            with open(pdf_file_path, "wb") as pdf_file:
                pdf_file.write(pdf_buffer.getvalue())

        message = EmailMultiAlternatives(
            subject=my_subject,
            body="Dear Tourist,\nAttached is your trip info PDF and Google Maps link. Safe travels! \n Best,\nCTE MAP",
            from_email=None,
            to=[my_recipient]
        )

        # message.attach_alternative(html_message, "text/html")
        # Attach the PDF file
        message.attach_file(pdf_file_path, mimetype='application/pdf')

        message.send()

        obj = Emails(
            subject=my_subject,
            message="We have send this email",
            email=my_recipient
        )
        obj.save()

        if response.status_code == 200:
            redirect("my_form_view")

        return super().form_valid(form)


def google_maps_link(location1, location2):
    # Parameters for the two locations

    # Encode the parameters for the Google Maps URL
    encoded_location1 = urlencode({'q': location1})
    encoded_location2 = urlencode({'q': location2})

    # Construct Google Maps link
    google_maps_url = f"https://www.google.com/maps/dir/?api=1&origin={encoded_location1}&destination={encoded_location2}"

    # # Pass the URL to the template
    # context = {
    #     'google_maps_url': google_maps_url
    # }

    return google_maps_url


def trip_form(request):
    if request.method == 'POST':
        form = TripForm(request.POST)
        if form.is_valid():
            # Prepare the link separately
            number = form.cleaned_data['number']
            link = google_maps_link(form.cleaned_data['start'], form.cleaned_data['end'])

            # Save the form with the prepared link
            trip = form.save(commit=False)
            trip.link = link
            trip.save()

            return redirect('my_form_view')  # Redirect to the list of trips after successfully saving the data
    else:
        form = TripForm()
    return render(request, 'sendemail/trip_form.html', {'form': form})
