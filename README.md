
# CTE Map - Tourist Map Guide Website

## Project Description

CTE Map is a tourist map guide website designed to enhance the travel experience for visitors to Cagliari. It provides an interactive platform with a touch screen computer screen for tourists to plan their travel itinerary, get information about points of interest, and receive a customized route via email.

## Features

- Interactive map with live popular data and markers and information for place of interest locations.
- Route planning for selected places of interest.
- Real-time weather information for better trip planning.
- Customized email with route details and Google Map links.

## Installation

To set up CTE Map on your system, follow these steps:

1. Install Python and Django.
   ```
   pip install django
   ```

2. Obtain a Google Maps API key.
   - [Google Maps API Documentation](https://developers.google.com/maps/documentation/javascript/get-api-key)

3. Set up OpenWeatherMap API.
   - [OpenWeatherMap API Documentation](https://openweathermap.org/api)

4. Configure email settings.
   - Set up an SMTP Gmail account for sending emails.

5. Install dependencies.
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Clone the repository.
   ```
   https://github.com/NahomaGebreamlak/CagliariTour.git 

2. Navigate to the project directory.
   ```
   cd CagliariTour
   ```

3. Run the Django development server.
   ```
   python manage.py runserver
   ```

4. Access the website at [http://localhost:8000](http://localhost:8000) and start planning your trip!

## Dependencies

- Python
- Django
- JavaScript
- Google Maps API
- OpenWeatherMap API
- SMTP Gmail
