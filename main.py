from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import joblib
import numpy as np
from typing import List, Optional
import pandas as pd
from sklearn.preprocessing import StandardScaler
import re

# Load the trained model and metadata
try:
    model = joblib.load("disease_prediction_model.pkl")
    metadata = joblib.load("model_metadata.pkl")
    
    # Extract required components from metadata with fallbacks
    all_symptoms = metadata.get('all_symptoms', [])
    scaler = metadata.get('scaler', StandardScaler())
    
    if not all_symptoms:
        # If no symptoms list in metadata, try to get it from the model
        try:
            all_symptoms = model.feature_names_in_
        except AttributeError:
            raise ValueError("No symptoms list found in metadata or model")
            
except Exception as e:
    print(f"Error loading model or metadata: {str(e)}")
    raise

# Initialize FastAPI app
app = FastAPI(
    title="Disease Prediction API",
    description="API for predicting diseases based on symptoms",
    version="1.0.0"
)

# API key for authentication
API_KEY = "q9o3wef9U3nf983nNef923nfENf9WEn"  # Secure API key

# Pydantic model for input validation
class SymptomInput(BaseModel):
    symptoms: List[str]

# Pydantic model for response
class PredictionResponse(BaseModel):
    disease: str
    confidence: float
    matched_symptoms: List[str]
    unmatched_symptoms: List[str]

def standardize_symptom(symptom: str) -> str:
    """Standardize symptom format for matching"""
    # Convert to lowercase
    symptom = symptom.lower()
    # Remove extra whitespace
    symptom = ' '.join(symptom.split())
    # Remove special characters
    symptom = re.sub(r'[^\w\s]', '', symptom)
    return symptom

def find_best_match(symptom: str, symptom_list: List[str]) -> Optional[str]:
    """Find the best matching symptom from the list"""
    standardized_input = standardize_symptom(symptom)
    
    # First try exact match
    for known_symptom in symptom_list:
        if standardize_symptom(known_symptom) == standardized_input:
            return known_symptom
    
    # Then try partial match
    for known_symptom in symptom_list:
        if standardized_input in standardize_symptom(known_symptom) or standardize_symptom(known_symptom) in standardized_input:
            return known_symptom
    
    return None

def prepare_input(symptoms: List[str]) -> tuple[np.ndarray, List[str], List[str]]:
    """Prepare the input data for the model"""
    # Create a zero vector of length equal to number of symptoms
    feature_vector = np.zeros(len(all_symptoms))
    
    # Track matched and unmatched symptoms
    matched_symptoms = []
    unmatched_symptoms = []
    
    # Set 1 for each symptom that exists in the input
    for symptom in symptoms:
        matched_symptom = find_best_match(symptom, all_symptoms)
        if matched_symptom:
            idx = all_symptoms.index(matched_symptom)
            feature_vector[idx] = 1
            matched_symptoms.append(matched_symptom)
        else:
            unmatched_symptoms.append(symptom)
    
    # Reshape to 2D array (1 sample, n features)
    feature_vector = feature_vector.reshape(1, -1)
    
    # Scale the features using the pre-fitted scaler
    try:
        scaled_features = scaler.transform(feature_vector)
    except Exception as e:
        print(f"Warning: Error in scaling features: {str(e)}")
        scaled_features = feature_vector  # Use unscaled features as fallback
    
    return scaled_features, matched_symptoms, unmatched_symptoms

@app.get("/")
async def root():
    """Root endpoint that provides API information"""
    return {
        "message": "Welcome to the Disease Prediction API",
        "documentation": "/docs",
        "endpoints": {
            "/predict": "POST endpoint for disease prediction",
            "/docs": "API documentation",
            "/symptoms": "GET list of all supported symptoms"
        }
    }

@app.get("/symptoms")
async def get_symptoms():
    """Get list of all supported symptoms"""
    return {
        "total_symptoms": len(all_symptoms),
        "symptoms": all_symptoms
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(
    input: SymptomInput,
    x_api_key: Optional[str] = Header(None)
):
    """
    Predict disease based on symptoms
    
    - **symptoms**: List of symptoms
    - **x_api_key**: API key for authentication
    
    Returns:
    - Predicted disease and confidence score
    - List of matched symptoms
    - List of unmatched symptoms
    """
    # Check API key
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )
    
    try:
        # Prepare input data
        X, matched_symptoms, unmatched_symptoms = prepare_input(input.symptoms)
        
        # Make prediction
        prediction = model.predict(X)[0]
        confidence = model.predict_proba(X).max()
        
        return PredictionResponse(
            disease=str(prediction),
            confidence=float(confidence),
            matched_symptoms=matched_symptoms,
            unmatched_symptoms=unmatched_symptoms
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error making prediction: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 