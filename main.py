import joblib
import numpy as np
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
import json

model = joblib.load('disease_model.pkl')
metadata = joblib.load('disease_model_metadata.pkl')

symptoms_list = metadata.get('symptoms_list', [])
disease_mapping = metadata.get('disease_mapping', {})
scaler = metadata.get('scaler', None)

if not symptoms_list and hasattr(model, 'feature_names_in_'):
    symptoms_list = model.feature_names_in_.tolist()

app = FastAPI(title="Disease Prediction API")

API_KEY = "q9o3wef9U3nf983nNef923nfENf9WEn"

class SymptomInput(BaseModel):
    symptoms: List[str]

class PredictionResponse(BaseModel):
    disease: str
    confidence: float
    matched_symptoms: List[str]
    unmatched_symptoms: List[str]

def preprocess_symptom(symptom: str) -> str:
    symptom = symptom.lower()
    symptom = ' '.join(symptom.split())
    symptom = ''.join(c for c in symptom if c.isalnum() or c.isspace())
    return symptom

def find_matching_symptoms(input_symptoms: List[str], available_symptoms: List[str]) -> List[str]:
    matched = []
    for symptom in input_symptoms:
        symptom = preprocess_symptom(symptom)
        if symptom in available_symptoms:
            matched.append(symptom)
            continue
        for available in available_symptoms:
            if symptom in available or available in symptom:
                matched.append(available)
                break
    return matched

def create_feature_vector(symptoms: List[str], all_symptoms: List[str]) -> np.ndarray:
    feature_vector = np.zeros(len(all_symptoms))
    matched_symptoms = []
    unmatched_symptoms = []
    
    for symptom in symptoms:
        symptom = preprocess_symptom(symptom)
        if symptom in all_symptoms:
            idx = all_symptoms.index(symptom)
            feature_vector[idx] = 1
            matched_symptoms.append(symptom)
        else:
            unmatched_symptoms.append(symptom)
    
    return feature_vector, matched_symptoms, unmatched_symptoms

def predict_disease(feature_vector: np.ndarray) -> tuple:
    feature_vector = feature_vector.reshape(1, -1)
    if scaler is not None:
        try:
            scaled_features = scaler.transform(feature_vector)
        except:
            scaled_features = feature_vector
    else:
        scaled_features = feature_vector
    
    probabilities = model.predict_proba(scaled_features)[0]
    predicted_class = model.predict(scaled_features)[0]
    confidence = probabilities[predicted_class]
    
    disease_name = disease_mapping.get(str(predicted_class), f"Disease {predicted_class}")
    
    return disease_name, confidence

@app.post("/predict", response_model=PredictionResponse)
async def predict_disease_endpoint(
    input_data: SymptomInput,
    api_key: str = Header(None)
):
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    matched_symptoms = find_matching_symptoms(input_data.symptoms, symptoms_list)
    feature_vector, matched_symptoms, unmatched_symptoms = create_feature_vector(
        matched_symptoms, symptoms_list
    )
    
    disease, confidence = predict_disease(feature_vector)
    
    return PredictionResponse(
        disease=disease,
        confidence=confidence,
        matched_symptoms=matched_symptoms,
        unmatched_symptoms=unmatched_symptoms
    ) 