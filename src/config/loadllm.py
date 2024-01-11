import os
import json
import requests

# KEY_FILE = "C:\\Users\\I742564\\projects\\agent-debate-v4\\src\\config\\key.json"
# Construct the path to key.json relative to the current file
dir_path = os.path.dirname(os.path.realpath(__file__))
KEY_FILE = os.path.join(dir_path, "key.json")

# Load the service key
with open(KEY_FILE, "r") as key_file:
    svc_key = json.load(key_file)
    
# Get Token
svc_url = svc_key["url"]
client_id = svc_key["uaa"]["clientid"]
client_secret = svc_key["uaa"]["clientsecret"]
url = svc_key["uaa"]["url"]

params = {"grant_type": "client_credentials" }
resp = requests.post(f"{url}/oauth/token",
                     auth=(client_id, client_secret),
                     params=params)

token = resp.json()["access_token"]


