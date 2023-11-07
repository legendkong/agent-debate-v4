import json
import requests

KEY_FILE = "C:\\Users\\I742564\\projects\\agent-debate-v4\\src\\config\\key.json"

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


