import requests
import os
import json

api_key = os.environ.get("GOOGLE_API_KEY") # Get from environment variable
test_model = "models/gemini-flash-latest"
url = f"https://generativelanguage.googleapis.com/v1beta/{test_model}:generateContent?key={api_key}"

headers = {"Content-Type": "application/json"}
data = {"contents": [{"parts": [{"text": "Hi"}]}]}

try:
    print(f"Testing {test_model}...")
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    print("Success!")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'response') and e.response is not None:
        print("Details:", e.response.text)
