import requests
from src.dependencies import timeout
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
import re


def extract_unique_urls(url, unwanted_url=[], keyword_list=[]):
#  Given the original url, find out the urls contained on that page which are unique and contain the keyword.
    try:
        response = requests.get(url, timeout=timeout)
    except Exception as e:
        print(f'Unable to access {url}')
        return []
    
    # Parse the HTML content
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find the HTML elements that contain the URLs you want to extract
    url_elements = soup.select('a[href]')  # Select all anchor tags with an href attribute

    # Extract the URLs from the HTML elements
    url_list = []
    url_by_keyword = {}
    for element in url_elements:
        url = element['href']
        if 'https://' not in url: continue
        
        # if url is not relevant, skip it
        relevant = True
        for each in unwanted_url:
            if each in url: relevant = False
        if not relevant: continue
        
        relevant = False
        for keyword in keyword_list:
            if keyword in url: relevant = True
        if not relevant: continue
        url_list.append(url)

    # Process the URLs or print the list
    return list(set(url_list))

# get first domain of url (www.sap.com -> sap) (not used)
def get_root_url(url):
    parsed_url = urlparse(url)
    root_url = parsed_url.scheme + '://' + parsed_url.netloc
    return root_url

def spaced_text(soup):
    return " ".join(t.strip() for t in soup.findAll(string=True) if t.parent.name not in ['style', 'script', 'head', 'title', 'meta', '[document]'])

def view_url(url, driver, timeout = timeout):
    # Views how GPT would see a webpage 
    try:
        # Get the webpage
        driver.get(url)

        # wait for the JavaScript to run with an implicit wait
        # we wait up to timeout seconds for the elements to become available
        driver.implicitly_wait(timeout)

        # Get the page source and parse it with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Send a GET request
        # response = requests.get(url, timeout = timeout)
        # Parse the HTML content
        # soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract metadata information
        # sometimes impt when metadata describes pictures
        text_content = 'Metadata:\n'
        meta_tags = soup.find_all("meta")
        for meta_tag in meta_tags:
            # Get the 'name' and 'content' attributes if present
            name = meta_tag.get("name")
            contents = meta_tag.get("content")
            if name and contents:
                text_content += f"{name}: {contents}\n"
                
        text_content = text_content + '\nMain Text:\n' + spaced_text(soup)

        # Do space processing
        text_content = re.sub('\n+', '\n', text_content)
        text_content = re.sub('\ {2,}', ' ', text_content)

    except Exception as e:
        print(e)
        return 'Unable to retrieve data'

    return text_content