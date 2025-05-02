import requests
import json

# API configuration
API_URL = "http://localhost:8001/predict"
API_KEY = "q9o3wef9U3nf983nNef923nfENf9WEn"

def predict_disease(symptoms):
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    data = {
        "symptoms": symptoms
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            print("\n" + "="*50)
            print(f"Symptoms: {', '.join(symptoms)}")
            print(f"Predicted Disease: {result['disease']}")
            print(f"Confidence: {result['confidence']:.2%}")
            print("="*50 + "\n")
        else:
            print(f"\nError: {response.status_code}")
            print(response.text)
    except requests.exceptions.ConnectionError:
        print("\nError: Could not connect to the API server.")
        print("Make sure the FastAPI server is running on port 8001.")
        print("Run: uvicorn main:app --host 0.0.0.0 --port 8001")

def main():
    print("Disease Prediction API Interactive Test")
    print("="*50)
    print("Enter symptoms one by one. Type 'done' when finished.")
    print("Example symptoms: itching, skin_rash, nodal_skin_eruptions, etc.")
    print("="*50)
    
    symptoms = []
    while True:
        symptom = input("\nEnter a symptom (or 'done' to finish): ").strip().lower()
        if symptom == 'done':
            break
        if symptom:
            symptoms.append(symptom)
    
    if symptoms:
        predict_disease(symptoms)
    else:
        print("\nNo symptoms entered. Exiting...")

if __name__ == "__main__":
    main() 