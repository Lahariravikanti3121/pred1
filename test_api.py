import requests
import json

BASE_URL = "https://predmodel-1.onrender.com:10000"
API_KEY = "q9o3wef9U3nf983nNef923nfENf9WEn"

def test_root():
    print("\nTesting root endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

def test_symptoms():
    print("\nTesting symptoms endpoint...")
    response = requests.get(f"{BASE_URL}/symptoms")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

def test_predict():
    print("\nTesting predict endpoint...")
    data = {
        "symptoms": ["fever", "cough", "headache"]
    }
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    response = requests.post(f"{BASE_URL}/predict", json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_root()
    test_symptoms()
    test_predict() 