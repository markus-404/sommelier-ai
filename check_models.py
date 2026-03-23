import os
import requests

api_key = os.environ.get("OPENAI_API_KEY") # Get from environment variable

url = "https://api.openai.com/v1/models"
headers = {
    "Authorization": f"Bearer {api_key}"
}

try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    result = response.json()
    print("Success! Models listed.")
    # print(json.dumps(result, indent=2))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'response') and e.response is not None:
        print("Details:", e.response.text)
