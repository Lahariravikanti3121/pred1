import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.decomposition import PCA
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.combine import SMOTEENN
import joblib
import json
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

class DiseasePredictor:
    def __init__(self):
        self.pipeline = None
        self.feature_cols = None
        self.disease_mapping = None
        self.unique_symptoms = None
        self.symptom_freq = None
        
    def preprocess_data(self, df, symptom_cols):
        """Preprocess the data and create features"""
        # Standardize symptom format
        for col in symptom_cols:
            df[col] = df[col].fillna("none")
            df[col] = df[col].apply(lambda x: f" {x.strip()}" if x != "none" else x)
        
        # Get unique symptoms
        unique_symptoms = set()
        for col in symptom_cols:
            unique_symptoms.update(df[col].unique())
        unique_symptoms.remove("none")
        self.unique_symptoms = unique_symptoms
        
        # Calculate symptom frequencies
        symptom_freq = Counter()
        for col in symptom_cols:
            symptom_freq.update(df[col].value_counts().to_dict())
        self.symptom_freq = dict(symptom_freq)
        
        # Create features
        feature_df = pd.DataFrame()
        
        # 1. Binary features
        for symptom in unique_symptoms:
            feature_name = f"has_{symptom.strip().replace(' ', '_')}"
            feature_df[feature_name] = df[symptom_cols].apply(
                lambda x: 1 if symptom in x.values else 0, axis=1
            )
        
        # 2. Symptom count
        feature_df["symptom_count"] = df[symptom_cols].apply(
            lambda x: sum(x != "none"), axis=1
        )
        
        # 3. Severity score
        feature_df["severity_score"] = df[symptom_cols].apply(
            lambda x: sum(symptom_freq.get(s, 0) for s in x if s != "none"),
            axis=1
        )
        
        # Store feature columns
        self.feature_cols = feature_df.columns.tolist()
        
        return feature_df
    
    def fit(self, df):
        """Train the model"""
        print("Starting model training...")
        
        # Get symptom columns
        symptom_cols = [col for col in df.columns if col.startswith("Symptom_")]
        print(f"Found {len(symptom_cols)} symptom columns")
        
        # Create disease mapping
        self.disease_mapping = {
            str(i): disease for i, disease in enumerate(df["Disease"].unique())
        }
        
        # Preprocess data
        print("\nPreprocessing data...")
        X = self.preprocess_data(df, symptom_cols)
        y = df["Disease"].map({v: k for k, v in self.disease_mapping.items()}).astype(int)
        
        # Print class distribution
        print("\nClass distribution:")
        print(pd.Series(y).value_counts())
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Calculate class weights
        class_weights = dict(enumerate(
            len(y) / (len(np.unique(y)) * np.bincount(y))
        ))
        
        # Create base models with balanced weights
        rf = RandomForestClassifier(
            n_estimators=500,
            max_depth=None,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            class_weight=class_weights,
            random_state=42,
            n_jobs=-1
        )
        
        gb = GradientBoostingClassifier(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=7,
            min_samples_split=5,
            min_samples_leaf=2,
            subsample=0.8,
            random_state=42
        )
        
        # Create pipeline with SMOTEENN for better balance
        self.pipeline = ImbPipeline([
            ('sampler', SMOTEENN(random_state=42)),
            ('scaler', StandardScaler()),
            ('feature_selection', SelectKBest(f_classif, k=100)),  # Keep more features
            ('classifier', rf)  # Use RF as main classifier
        ])
        
        # Train model
        print("\n...")
        self.pipeline.fit(X_train, y_train)
        
        # Evaluate
        print("\n...")
        y_pred = self.pipeline.predict(X_test)
        
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        
        print("\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        
        # Save metadata
        metadata = {
            "feature_cols": self.feature_cols,
            "disease_mapping": self.disease_mapping,
            "unique_symptoms": list(self.unique_symptoms),
            "symptom_freq": self.symptom_freq
        }
        
        return metadata

def main():
    # Load data
    print("Loading dataset...")
    df = pd.read_csv("dataset_embeddings.csv")
    print(f"Dataset shape: {df.shape}")
    
    # Create and train model
    model = DiseasePredictor()
    metadata = model.fit(df)
    
    # Save model and metadata
    print("\nSaving model and metadata...")
    joblib.dump(model.pipeline, "disease_prediction_model.pkl")
    joblib.dump(metadata, "model_metadata.pkl")
    
    # Save mappings to JSON for easy reading
    with open("disease_mapping.json", "w") as f:
        json.dump(metadata["disease_mapping"], f, indent=2)
    
    with open("symptom_frequencies.json", "w") as f:
        json.dump(metadata["symptom_freq"], f, indent=2)
    
    print("\nExiting...")

if __name__ == "__main__":
    main() 