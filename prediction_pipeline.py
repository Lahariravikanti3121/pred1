import pandas as pd
import numpy as np
import joblib
import json
from collections import Counter
from typing import List, Dict, Any

class DiseasePredictionPipeline:
    def __init__(self):
        # Load the trained model and metadata
        self.pipeline = joblib.load("disease_prediction_model.pkl")
        metadata = joblib.load("model_metadata.pkl")
        
        # Load feature information
        self.feature_cols = metadata["feature_cols"]
        self.symptom_freq = metadata["symptom_freq"]
        self.unique_symptoms = set(metadata["unique_symptoms"])
        self.disease_mapping = metadata["disease_mapping"]
    
    def _create_feature_vector(self, symptoms: List[str]) -> np.ndarray:
        """Create a feature vector matching the training pipeline"""
        # Initialize feature DataFrame with zeros
        feature_df = pd.DataFrame(0, index=[0], columns=self.feature_cols)
        
        # 1. Set binary features
        for symptom in symptoms:
            feature_name = f"has_{symptom.strip().replace(' ', '_')}"
            if feature_name in feature_df.columns:
                feature_df.loc[0, feature_name] = 1
        
        # 2. Set symptom count
        feature_df.loc[0, "symptom_count"] = len(symptoms)
        
        # 3. Set severity score
        severity_score = sum(self.symptom_freq.get(s, 0) for s in symptoms)
        feature_df.loc[0, "severity_score"] = severity_score
        
        # Convert to numpy array
        return feature_df.values
    
    def predict(self, symptoms: List[str]) -> Dict[str, Any]:
        """Make a prediction for the given symptoms"""
        # Create feature vector
        X = self._create_feature_vector(symptoms)
        
        # Get prediction and probability using the full pipeline
        prediction = self.pipeline.predict(X)[0]
        probabilities = self.pipeline.predict_proba(X)[0]
        confidence = probabilities[prediction]
        
        # Map prediction to disease name
        predicted_disease = self.disease_mapping[str(prediction)]
        
        # Create probabilities dictionary
        prob_dict = {
            self.disease_mapping[str(i)]: float(prob)
            for i, prob in enumerate(probabilities)
        }
        
        return {
            "disease": predicted_disease,
            "confidence": float(confidence),
            "probabilities": prob_dict
        }

    def validate_symptoms(self, symptoms: List[str]) -> List[str]:
        """Validate and clean input symptoms"""
        processed_symptoms = []
        for symptom in symptoms:
            # Add space prefix and strip whitespace
            processed = f" {symptom.strip()}"
            if processed in self.unique_symptoms:
                processed_symptoms.append(processed)
            else:
                raise ValueError(f"Invalid symptom: {symptom}")
        return processed_symptoms 