import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CagliariTouristProject.settings')
import django
django.setup()

import csv
from cagliaritour.models import Place




def import_data_from_csv(file_path):
    with open(file_path, 'r', encoding='ISO-8859-1') as file:  # Specify the encoding here
        reader = csv.DictReader(file)
        for row in reader:
            place = Place(
                ID=row['ID'],
                Name=row['Name'],
                Category=row['Category'],
                Description=row['Description'],
                OpeningTime=row['OpeningTime'],
                Website=row['Website'],
                PhoneNumber=row['PhoneNumber'],
                Location=row['Location'],
                Address=row['Address'],
                Toilet=row['Toilet'] == 'True',
                Accessibility=row['Accessibility'] == 'True',
                Animals=row['Animals'] == 'True',
                VisitTime=row['VisitTime'],
                Map_Priority=row['Map Priority'],
                Image=row['Image'],
                Icon=row['Icon']
            )
            place.save()

import_data_from_csv("/Users/nahomchi/PycharmProjects/CagliariTouristProject/Dataset.csv")