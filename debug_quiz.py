import requests
import json

url = "http://127.0.0.1:8000/generate_quiz"
payload = {
    "topic": "History",
    "difficulty": "medium",
    "num_questions": 5,
    "notebookId": "nb-123"
}
headers = {"Content-Type": "application/json"}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    
    with open("debug_result.txt", "w", encoding="utf-8") as f:
        f.write(f"Status Code: {response.status_code}\n")
        f.write(f"Response: {response.text}\n")
    print("Done")
except Exception as e:
    print(f"Request failed: {e}")
