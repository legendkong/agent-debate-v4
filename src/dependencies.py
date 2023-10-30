import os
import requests
import openai
import tiktoken
from langchain.text_splitter import TokenTextSplitter
import json
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import pandas as pd
import pprint
import re
from selenium import webdriver
from selenium.webdriver.firefox.options import Options

# No information default
NO_INFO = "No info"

# Max token length for chatgpt
MAX_TOKENS = 3000

# max timeout to wait for url opening (let js elements load up in selenium web browser before extracting html)
timeout = 40
