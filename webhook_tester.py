import requests

import requests

url = '' # A test endpoint that echoes the request data
payload = {
    "message": "Hello World, Welcome to the World of Tomorrow",
    "sessionId": "123"

}

# The 'requests' library automatically serializes the dictionary to a JSON string
# and sets the 'Content-Type' header to 'application/json'.
response = requests.post(url, json=payload)

# Check the response status code
if response.status_code == 200:
    print("Request successful!")
    # Parse the JSON response body into a Python dictionary
    response_data = response.json()
    # print(response_data) 
else:
    print(f"Request failed with status code: {response.status_code}")

# You can access the raw response text using response.text
print(response.text)
