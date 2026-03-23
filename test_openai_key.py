import requests
import json
import os

api_key = os.environ.get("OPENAI_API_KEY") # Get from environment variable

url = "https://api.openai.com/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}
data = {
    "model": "gpt-4o-mini",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello! Please respond with 'API Key is working!' if you can see this."}
    ]
}

try:
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    result = response.json()
    print("Success!")
    print("Response:", result['choices'][0]['message']['content'])
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'response') and e.response is not None:
        print("Details:", e.response.text)
