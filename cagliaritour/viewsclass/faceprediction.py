import base64
import cv2
import numpy as np
from django.http import JsonResponse
from deepface import DeepFace
from django.views.decorators.csrf import csrf_exempt
import json

# Preload models
age_model = DeepFace.build_model('VGG-Face')  # Preload 'VGG-Face' or another model for age
race_model = DeepFace.build_model('VGG-Face')  # Reuse or specify different models as needed

@csrf_exempt
def analyze_image(request):
    try:
        # Parse JSON data from the request body
        data = json.loads(request.body)
        if 'image' not in data:
            return JsonResponse({"message": "No image data provided", "status": "error"}, status=400)

        image_data = data['image']
        image_bytes = base64.b64decode(image_data)
        np_image = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)

        # Resize the image for faster processing
        image = cv2.resize(image, (224, 224))

        # Analyze the image (the models are implicitly used by DeepFace)
        demography = DeepFace.analyze(image, actions=['age', 'race'], enforce_detection=False)

        # Construct response
        response = {
            'age': demography[0]["age"],
            'race': demography[0]["dominant_race"]
        }
        return JsonResponse(response, status=200)

    except Exception as e:
        # Print exception for debugging
        print("Error during analysis:", str(e))
        return JsonResponse({"message": str(e), "status": "error"}, status=400)
