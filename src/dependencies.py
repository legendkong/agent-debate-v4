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

# Base hyperparameters here (No need to adjust)
NO_INFO = "No info"
MAX_TOKENS = 3000
timeout = 2