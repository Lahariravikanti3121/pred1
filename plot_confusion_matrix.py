import pandas as pd
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report
import joblib
import json
from collections import Counter
import matplotlib.pyplot as plt
import seaborn as sns

# Load the trained model and metadata
print("Loading model and metadata...")
model = joblib.load("disease_prediction_model.pkl")
metadata = joblib.load("model_metadata.pkl")

# Load disease mapping
with open("disease_mapping.json", "r") as f:
    disease_mapping = json.load(f)

# Load the dataset
print("Loading dataset...")
df = pd.read_csv("dataset_embeddings.csv")

# Get symptom columns
symptom_cols = [col for col in df.columns if col.startswith("Symptom_")]
print(f"Found {len(symptom_cols)} symptom columns")

# Standardize symptom format
print("\nStandardizing symptom format...")
for col in symptom_cols:
    df[col] = df[col].fillna("none")
    df[col] = df[col].apply(lambda x: f" {x.strip()}" if x != "none" else x)

# Create all required features
print("\nCreating features...")
required_features = metadata["feature_cols"]
print(f"Required features: {len(required_features)}")

# Get unique symptoms from metadata
unique_symptoms = metadata.get("unique_symptoms", set())
print(f"Unique symptoms from training: {len(unique_symptoms)}")

# Initialize binary features DataFrame with all possible symptoms
binary_features = pd.DataFrame(0, index=df.index, 
                             columns=[f"has_{s.strip().replace(' ', '_')}" for s in unique_symptoms])

# Process symptoms and set binary features
print("\nProcessing symptoms...")
for symptom_col in symptom_cols:
    symptoms = df[symptom_col].values
    for symptom in symptoms:
        if symptom != "none" and symptom in unique_symptoms:
            feature_name = f"has_{symptom.strip().replace(' ', '_')}"
            binary_features.loc[:, feature_name] = 1

# Calculate symptom count
print("\nCalculating symptom counts...")
symptom_count = df[symptom_cols].apply(lambda x: sum(x != "none"), axis=1)

# Calculate severity score using the same frequency mapping from training
print("\nCalculating severity scores...")
symptom_freq = metadata.get("symptom_freq", {})
severity_score = df[symptom_cols].apply(
    lambda x: sum(symptom_freq.get(s, 0) for s in x if s != "none"),
    axis=1
)

# Calculate symptom severity ratio
print("\nCalculating severity ratios...")
severity_ratio = severity_score / (symptom_count + 1)

# Combine all features
print("\nCombining features...")
feature_df = pd.concat([
    binary_features,
    pd.Series(symptom_count, name="symptom_count"),
    pd.Series(severity_score, name="severity_score"),
    pd.Series(severity_ratio, name="symptom_severity_ratio")
], axis=1)

# Verify features match training exactly
print("\nVerifying features...")
missing_features = set(required_features) - set(feature_df.columns)
extra_features = set(feature_df.columns) - set(required_features)

if missing_features:
    print(f"Warning: Missing features: {missing_features}")
    for feature in missing_features:
        feature_df[feature] = 0

if extra_features:
    print(f"Warning: Extra features found: {extra_features}")
    feature_df = feature_df.drop(columns=list(extra_features))

# Prepare features in the correct order
print("\nPreparing features...")
X = feature_df[required_features].values
print(f"Feature matrix shape: {X.shape}")
print("Feature names:", required_features)

y = df["Disease"].map({v: k for k, v in disease_mapping.items()}).astype(int)

# Make predictions
print("\nMaking predictions...")
y_pred = model.predict(X)

# Generate confusion matrix
print("\nGenerating confusion matrix...")
cm = confusion_matrix(y, y_pred)

# Create a figure with a larger size
plt.figure(figsize=(15, 12))

# Create heatmap
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=disease_mapping.values(),
            yticklabels=disease_mapping.values())

# Add labels and title
plt.title('Confusion Matrix for Disease Prediction Model')
plt.xlabel('Predicted Disease')
plt.ylabel('Actual Disease')
plt.tight_layout()

# Save the plot
plt.savefig('confusion_matrix.png')
print("Confusion matrix plot saved as 'confusion_matrix.png'")

# Print classification report with disease names
print("\nClassification Report:")
print(classification_report(y, y_pred, target_names=disease_mapping.values()))

# Calculate and print overall accuracy
accuracy = np.sum(np.diag(cm)) / np.sum(cm)
print(f"\nOverall Model Accuracy: {accuracy:.2%}")

# Print detailed interpretation
print("\nDetailed Interpretation:")
for i, disease in enumerate(disease_mapping.values()):
    correct = cm[i,i]
    total = np.sum(cm[i])
    print(f"\n{disease}:")
    print(f"- Correctly predicted: {correct} out of {total} cases ({correct/total:.2%})")
    
    misclassified = []
    for j, other_disease in enumerate(disease_mapping.values()):
        if i != j and cm[i,j] > 0:
            misclassified.append(f"{other_disease} ({cm[i,j]} cases)")
    
    if misclassified:
        print("- Misclassified as:", ", ".join(misclassified)) 