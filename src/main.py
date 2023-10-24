import os
from dependencies import *
from dotenv import load_dotenv
from config import query, keyword_list, unwanted_url, max_url_per_site, num_google_queries, twenty, output_format, base_index
from webdriver_util import start_driver

# Load environment variables
load_dotenv()

# Now you can access your environment variables as follows:
openai.api_key = os.getenv('OPENAI_API_TOKEN')
api_key = os.getenv('CUSTOM_JSON_API_KEY')
cx = os.getenv('GOOGLE_PROGRAMMABLE_SEARCH_ENGINE')

driver = start_driver()