import os
from src.dependencies import *
from dotenv import load_dotenv
from src.config import query, keyword_list, unwanted_url, max_url_per_site, num_google_queries, twenty, output_format, base_index
from src.webdriver_util import start_driver
from src.openai_util import strict_output
from src.scraping_util import extract_unique_urls, get_root_url, spaced_text, view_url

# Load environment variables
load_dotenv()

# Access environment variables as follows:
openai.api_key = os.getenv('OPENAI_API_TOKEN')
api_key = os.getenv('CUSTOM_JSON_API_KEY')
cx = os.getenv('GOOGLE_PROGRAMMABLE_SEARCH_ENGINE')

driver = start_driver()

res = strict_output(system_prompt = f'''You are a helpful assistant meant to design google web queries to find information. Give {num_google_queries} suitable queries to get information corresponding to what the user wants.''',
                    user_prompt = f'''Base Query: {query}, Output Format: {output_format}''', 
                    output_format = {"query"+str(i):"query text" for i in range(num_google_queries)},
                    output_value_only = True)

search_terms = res
if num_google_queries == 1:
    search_terms = [search_terms]
print(search_terms)

# Get the search results from google 
# NOTE: Do not run this cell too often, you only have 100 search API calls a day!

datalist = []
# this is for the first 10 sites for each search term
for search_term in search_terms:
    # Send a GET request to the Custom Search API
    response = requests.get(f'https://www.googleapis.com/customsearch/v1?key={api_key}&cx={cx}&q={search_term}')
    
    # Extract the relevant information from the response
    data = response.json()
    
    datalist.append(data)

# this one is for the next 10 sites for each search term
if twenty:
    for search_term in search_terms:
        # Send a GET request to the Custom Search API
        response = requests.get(f'https://www.googleapis.com/customsearch/v1?key={api_key}&cx={cx}&q={search_term}&start=10')

        # Extract the relevant information from the response
        data = response.json()

        datalist.append(data)
        
        # Use the Google results and populate the URL dictionary
urldict = {}
mainurllist = []
for num, data in enumerate(datalist):
    print(f'Doing split {num+1} out of {len(datalist)}, search term: {search_terms[num%len(search_terms)]}')
    # Process the search results and get list of secondary sources
    items = data.get('items', [])
    for item in items:
        title = item.get('title')
        snippet = item.get('snippet')
        url = item.get('link')
        # if url has been done before, skip it
        if url in urldict: continue
        
        # if url is not relevant, skip it
        relevant = True
        for each in unwanted_url:
            if each in url: relevant = False
        if not relevant: continue
            
        urldict[url] = title
        mainurllist.append(url)
        
        ## Secondary Links from primary link
        new_urls = extract_unique_urls(url, unwanted_url = unwanted_url, keyword_list = keyword_list)
        print(f'Main url: {url}, Secondary url: {new_urls}')
        for new_url in new_urls:
            # if url has been done before, skip it
            if new_url in urldict: continue
            # populate the new url dictionary
            urldict[new_url] = title

# print(urldict)

print('Original main search url numbers:', len(mainurllist))
print('Original total search url numbers:', len(urldict))

## Get new dictionary with title as key and list of urls as value
titledict = {}
for key, value in urldict.items():
    value = value.replace('’','\'')
    if value not in titledict:
        titledict[value] = [key]
    else:
        titledict[value].append(key)
        
        
newurldict = {}
for key, value in titledict.items():
    ## curate each site to only top max_url_per_site entries
    if len(value) > max_url_per_site:
        res = strict_output(system_prompt = f'''You are a helpful assistant given the urls and title of the urls and are meant to filter the urls which match the query "{query}" into the given output format: {output_format}
Return the {max_url_per_site} most relevant urls for the query "{query}"''',
            user_prompt = f'''Title: {key}, URLs: {value[:50]}''',
            output_format = {"URL_List": "URL list in a string separated by space"})
        # if fail, just pick first max_url_per_site
        if res == {}:
            print('GPT filtering failed, doing manual filtering')
            value = value[:max_url_per_site]
            for each in value:
                if 'http' in each: newurldict[each] = key
        else:
            print(f'Original list: {value}')
            value = res['URL_List'].split(' ')
            print(f'Curated list: {value}')
            for each in value:
                if 'http' in each: newurldict[each] = key
    else:
        for each in value:
            if 'http' in each: newurldict[each] = key
            
            
print(f'Initial curated number: {len(newurldict)}')
impturl = list(newurldict.keys())

## Add back urls from main google search results, as they are most beneficial
for url in mainurllist:
    if url not in newurldict:
        newurldict[url] = urldict[url]
        
print(f'Final curated number: {len(newurldict)}')
impturl = list(newurldict.keys())

impturl

# TO DO: Get the data from the curated list