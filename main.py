from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import joblib
import numpy as np
from typing import List, Optional
import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Load the trained model
model = joblib.load("disease_prediction_model.pkl")

# Initialize FastAPI app
app = FastAPI(title="Disease Prediction API")

# API key for authentication
API_KEY = "q9o3wef9U3nf983nNef923nfENf9WEn"  # Secure API key

# Pydantic model for input validation
class SymptomInput(BaseModel):
    symptoms: List[str]

# Pydantic model for response
class PredictionResponse(BaseModel):
    disease: str
    confidence: float

def prepare_input(symptoms: List[str]) -> np.ndarray:
    """Prepare the input data for the model"""
    # Create a DataFrame with the same structure as training data
    symptom_cols = [f"Symptom_{i+1}" for i in range(17)]  # Adjust based on your model's input features
    df = pd.DataFrame(columns=symptom_cols)
    
    # Fill the symptoms
    for i, symptom in enumerate(symptoms):
        if i < len(symptom_cols):
            df[symptom_cols[i]] = [symptom]
    
    # Fill remaining columns with "none"
    for col in symptom_cols[len(symptoms):]:
        df[col] = ["none"]
    
    # Encode symptoms
    for col in symptom_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
    
    return df.values

@app.post("/predict", response_model=PredictionResponse)
async def predict(
    input: SymptomInput,
    x_api_key: Optional[str] = Header(None)
):
    # Check API key
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )
    
    try:
        # Prepare input data
        X = prepare_input(input.symptoms)
        
        # Make prediction
        prediction = model.predict(X)[0]
        confidence = model.predict_proba(X).max()
        
        return PredictionResponse(
            disease=str(prediction),
            confidence=float(confidence)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error making prediction: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 