from django.http import JsonResponse


def calculate_route(request):
    json_response = {
        "guide": [
            {
                "day": "14/08/2023",
                "POIs": [
                    "Cagliari Port",
                    "Museo Archeologico",
                    "Teatro Romano",
                    "Santuario di Bonaria",
                    "Basilica S. Saturnino",
                    "Marina di Bonaria"
                ],
                "visitTime": [
                    "08:30-09:00",
                    "09:30-11:30",
                    "12:00-12:30",
                    "15:00-15:30",
                    "16:00-16:30",
                    "17:00-18:00"
                ]
            },
            {
                "day": "15/08/2023",
                "POIs": [
                    "Bastione Saint Remy",
                    "Teatro Lirico",
                    "Necropoli Tuvixeddu",
                    "Parco di Monteclaro",
                    "Cagliari Port",
                    "Museo Archeologico",
                    "Teatro Romano",
                    "Santuario di Bonaria",
                    "Basilica S. Saturnino",
                    "Marina di Bonaria"
                ],
                "visitTime": [
                    "08:30-09:30",
                    "10:30-12:00",
                    "15:00-17:30",
                    "18:30-19:30"
                ]
            },
            {
                "day": "16/08/2023",
                "POIs": [
                    "Parco Monte Urpinu",
                    "Poetto Beach",
                    "Sella del Diavolo",
                    "Cagliari Port"
                ],
                "visitTime": [
                    "09:00-09:30",
                    "11:00-16:00",
                    "17:00-19:00",
                    "20:00-20:30"
                ]
            }
        ]
    }
    return JsonResponse(json_response)
