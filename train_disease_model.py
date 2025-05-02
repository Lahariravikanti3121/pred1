import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

print("Starting script execution...")

# Load dataset
print("Loading dataset...")
df = pd.read_csv("dataset_embeddings.csv")
print(f"Dataset loaded with shape: {df.shape}")

# Identify symptom columns
symptom_cols = [col for col in df.columns if col.startswith("Symptom_")]
print(f"Found {len(symptom_cols)} symptom columns")

# Fill missing symptom values
print("Filling missing values...")
df[symptom_cols] = df[symptom_cols].fillna("none")

# Encode symptoms with LabelEncoder
print("Encoding symptoms...")
encoders = {}
for col in symptom_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# Define features (X) and target (y)
X = df[symptom_cols]
y = df["Disease_label"].astype(int)  # Ensure it's integer for classification
print(f"Features shape: {X.shape}, Target shape: {y.shape}")

# Split dataset into training and test sets
print("Splitting dataset...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Random Forest model
print("Training model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Predict on test set
print("Making predictions...")
y_pred = model.predict(X_test)

# Evaluate model
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred, zero_division=0)

print(f"\n✅ Model Accuracy: {accuracy:.4f}")
print("\n📊 Classification Report:\n", report)

# Save model
print("Saving model...")
joblib.dump(model, "disease_prediction_model.pkl")
print("\n💾 Model saved as: disease_prediction_model.pkl")
