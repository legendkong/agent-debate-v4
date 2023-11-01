import json
import requests

KEY_FILE = "C:\\Users\\I742564\\projects\\agent-debate-v4\\src\\agents\\key.json"

# Load the service key
with open(KEY_FILE, "r") as key_file:
    svc_key = json.load(key_file)
    
# Get Token
svc_url = svc_key["url"]
client_id = svc_key["uaa"]["clientid"]
client_secret = svc_key["uaa"]["clientsecret"]
uaa_url = svc_key["uaa"]["url"]

params = {"grant_type": "client_credentials" }
resp = requests.post(f"{uaa_url}/oauth/token",
                     auth=(client_id, client_secret),
                     params=params)

token = resp.json()["access_token"]


# # gpt-35-turbo example, uses Chat Completions API format, note the use of messages array instead of prompt

# data = {
#     "deployment_id": "gpt-35-turbo",
#     "messages": [
#         {"role": "system", "content": "Assistant is an intelligent chatbot designed to help users answer their tax related questions.\n\nInstructions:\n- Only answer questions related to taxes.\n- If you're unsure of an answer, you can say \"I don't know\" or \"I'm not sure\" and recommend users go to the IRS website for more information."},
#         {"role": "user", "content": "When are my taxes due?"}
#     ],
#     "max_tokens": 100,
#     "temperature": 0.0,
#     "frequency_penalty": 0,
#     "presence_penalty": 0,
#     "stop": "null"
# }

# headers = {
#     "Authorization":  f"Bearer {token}",
#     "Content-Type": "application/json"
# }

# response = requests.post(f"{svc_url}/api/v1/completions",
#                          headers=headers,
#                          json=data)
# print(response.json())