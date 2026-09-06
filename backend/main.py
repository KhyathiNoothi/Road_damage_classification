"""
FastAPI backend for Road Damage Classification.

Loads a trained Keras CNN model (Crack / Manhole / Pothole) and exposes
a single endpoint that accepts an uploaded image and returns the
predicted class and per-class probabilities.

IMPORTANT: The model already contains a Rescaling(1./255) layer as its
first layer, so this backend feeds RAW pixel values (0-255) into the
model. Do NOT divide by 255 here — that would normalize twice and break
predictions.
"""

import io

import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from tensorflow.keras.models import load_model

# ---------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------

MODEL_PATH = "model.keras"          # path to your saved .keras model
IMAGE_SIZE = (224, 224)             # must match training input size
CLASS_NAMES = ["Crack", "Manhole", "Pothole"]  # must match training class order

# ---------------------------------------------------------------------
# App + model setup
# ---------------------------------------------------------------------

app = FastAPI(title="Road Damage Classification API")

# Allow your frontend (running on a different port/origin) to call this API.
# For beginner simplicity this allows all origins — restrict this in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model once at startup, not on every request.
model = load_model(MODEL_PATH)


# ---------------------------------------------------------------------
# Helper: turn an uploaded image file into a model-ready array
# ---------------------------------------------------------------------

def preprocess_image(file_bytes: bytes) -> np.ndarray:
    """
    Convert raw uploaded image bytes into a (1, 224, 224, 3) float32
    array of RAW pixel values (0-255). The model's own Rescaling layer
    handles normalization, so we deliberately do NOT divide by 255 here.
    """
    image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    image = image.resize(IMAGE_SIZE)

    array = np.array(image, dtype=np.float32)      # shape: (224, 224, 3), values 0-255
    array = np.expand_dims(array, axis=0)           # shape: (1, 224, 224, 3)
    return array


# ---------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Accepts an uploaded image file, runs it through the CNN, and
    returns the predicted class plus probabilities for all 3 classes.
    """
    file_bytes = await file.read()
    input_array = preprocess_image(file_bytes)

    predictions = model.predict(input_array)   # shape: (1, 3)
    probabilities = predictions[0]              # shape: (3,)

    predicted_index = int(np.argmax(probabilities))
    predicted_class = CLASS_NAMES[predicted_index]

    return {
        "predicted_class": predicted_class,
        "probabilities": {
            "Crack": float(probabilities[0]),
            "Manhole": float(probabilities[1]),
            "Pothole": float(probabilities[2]),
        },
    }


# ---------------------------------------------------------------------
# Simple health check endpoint (useful for testing the server is up)
# ---------------------------------------------------------------------

@app.get("/")
def health_check():
    return {"status": "Road Damage Classification API is running"}
