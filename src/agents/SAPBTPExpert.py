import os
from src.dependencies import *
from dotenv import load_dotenv
from src.config import keyword_list, unwanted_url, max_url_per_site, num_google_queries, twenty, output_format, base_index, curated_format
from src.webdriver_util import start_driver
from src.openai_util import strict_output
from src.scraping_util import extract_unique_urls, get_root_url, spaced_text, view_url

# Load environment variables
load_dotenv()

# Access environment variables as follows:
openai.api_key = os.getenv('OPENAI_API_TOKEN')
api_key = os.getenv('CUSTOM_JSON_API_KEY')
cx = os.getenv('GOOGLE_PROGRAMMABLE_SEARCH_ENGINE')


###############################
# SAP BTP EXPERT AGENT
###############################
def SAPBTPExpert(btp_expert_task):
    
    res = strict_output(system_prompt = f'''You are a helpful assistant meant to help
                        the SAP BTP expert to design google 
                        web queries to find solutions and information to address the tasks which 
                        the Senior Consultant assigned you to do.
                        Give {num_google_queries} suitable queries to get information corresponding 
                        to what the senior consultant assigned you to do.''',
                        user_prompt = f'''Base Query: {btp_expert_task}, Output Format: {output_format}''', 
                        output_format = {"query"+str(i):"query text" for i in range(num_google_queries)},
                        output_value_only = True)

    search_terms = res
    if num_google_queries == 1:
        search_terms = [search_terms]
    print()
    print("SAP BTP Expert is cracking his head and thinking of the best queries to find the information ...")
    print(search_terms)

    # Get the search results from google 
    # the free api only has 100 search API calls a day so we need to limit the number of search terms

    datalist = []
    # this is for the first 10 sites for each search term
    for search_term in search_terms:
        # Send a GET request to the Custom Search API
        response = requests.get(f'https://www.googleapis.com/customsearch/v1?key={api_key}&cx={cx}&q={search_term}')
        
        # Extract the relevant information from the response
        data = response.json()
        datalist.append(data)
        
        # # Error handling for invalid JSON response
        # try:
        #     data = json.loads(response.text)
        # except json.JSONDecodeError:
        #     print("Received invalid JSON or no data for the search term:", search_term)
        #     continue
        # datalist.append(data)

    # this one is for the next 10 sites for each search term (only if twenty is set to true)
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
        # limit items to top 5 hits
        items = items[:5]
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
            max_secondary_urls = 5
            new_urls = extract_unique_urls(url, unwanted_url = unwanted_url, keyword_list = keyword_list)[:max_secondary_urls]
            print(f'Main url: {url}, Secondary url: {new_urls}')
            for new_url in new_urls:
                # if url has been done before, skip it
                if new_url in urldict: continue
                # populate the new url dictionary
                urldict[new_url] = title

    # print(urldict)

#     print('Original main search url numbers:', len(mainurllist))
#     print('Original total search url numbers:', len(urldict))
    
    
    #--------  FILTERING --------#
    # Get at most max_url_per_site sites per main site (title as key)
    # Use GPT to decide which sites are more important

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
            res = strict_output(system_prompt = f'''You are a helpful assistant meant to help
                                the SAP BTP expert with filtering. Given the urls and
                                title of the urls, filter the urls which 
                                match the query "{search_terms}" into the given output format: {output_format}
                                Return the {max_url_per_site} most relevant urls for the query "{search_terms}"''',
                user_prompt = f'''Title: {key}, URLs: {value[:50]}''',
                output_format = {"URL_List": "URL list in a string separated by space"})
            # if fail, just pick first max_url_per_site
            if res == {}:
                print('GPT filtering failed, doing manual filtering')
                value = value[:max_url_per_site]
                for each in value:
                    if 'http' in each: newurldict[each] = key
            else:
                # print(f'Original list: {value}')
                value = res['URL_List'].split(' ')
                # print(f'Curated list: {value}')
                for each in value:
                    if 'http' in each: newurldict[each] = key
        else:
            for each in value:
                if 'http' in each: newurldict[each] = key
                
                
    # print(f'Initial curated number: {len(newurldict)}')
    impturl = list(newurldict.keys())

    ## Add back urls from main google search results, as they are most beneficial
    for url in mainurllist:
        if url not in newurldict:
            newurldict[url] = urldict[url]
            
    # print(f'Final curated number: {len(newurldict)}')
    impturl = list(newurldict.keys())

    print("The most important and relevant websites:")
    print(impturl)
    print("SAP BTP Expert: I have found the most relevant websites to find the information you need. I will now proceed to extract the information from the websites ...")
#     # e.g:
# #   ['https://www.cloud.sap/xxxx',
# #  'https://www.cloud.sap/yyyy',
# #  'https://www.btp.sap/zzzz',
# #  'https://www.btp.sap/bbbb',
# #  'https://www.kyma.sap/aaaa',
# #  'https://www.foundry.sap/cost-and-pricing',
# #  'https://www.btp.sap/ghhgs',
# #  'https://www.btp.sap/sasd']

#     ####################################
#     # Get the content from the websites (get data from curated list of websites)
#     ####################################

    # Start selenium driver, parse through websites from curated website list and get data
    driver = start_driver()

    # if we start from scatch, reset content
    content = {}
    irrelevant_url = []
    currentnum = 0

    ## Get the data from the websites
    for num, url in enumerate(impturl):
        
        # to help in case we have runtime error, simply continue from those that have been done
        if num < currentnum: continue
        currentnum = max(num, currentnum)
        
        print(url, f'(URL #{num+1} of {len(impturl)})')
        text_content = view_url(url, driver=driver)
        
        # filter the text into manageable bits for the parser
        text_splitter = TokenTextSplitter(chunk_size=MAX_TOKENS, chunk_overlap=100)
        texts = text_splitter.split_text(text_content)
        
        # root_url = get_root_url(url)
        root_url = url
        
        # Cap the number of chunks per site to be 5 (initially 4)
        for text in texts[:5]:
            existing_entry = 'None'
            if root_url in content:
                existing_entry = content[root_url]

            # Use GPT-3.5-turbo to get information from website
            res = strict_output(system_prompt = f'''You are a SAP BTP expert meant to find information 
                                and solutions based on the task assigned by the senior consultant. 
                                Extract information from text that is related to {search_terms}, then list 
                                the steps required to be taken in order to achieve what the senior consultant
                                has assigned you to do: {btp_expert_task}.
                                If there is existing data, add on to it.
                                Limit the "Steps" field to 700 words.
                                If you are unsure about any of the output fields, output {NO_INFO}''',
                                user_prompt = f'''Url: {url}, Existing Data: {existing_entry}, Text: {text}''', 
                                output_format = curated_format)
            
            if res=={}:
                print('Empty JSON output'); break
            if res.get(base_index) == NO_INFO: 
                print('Information not relevant')
                irrelevant_url.append(url)
                break
                
            content[root_url] = res
            print(res)
            
            
    # make the content such that it merges all the available content together
    final_content = {}
    final_content_sources = {}
    for key, value in content.items():
        name = value[base_index]
        # add the webpage to the source
        if name not in final_content_sources:
            final_content_sources[name] = [key]
        else:
            final_content_sources[name].append(key)
        
        if name not in final_content:
            final_content[name] = value
        else:
            # use GPT to match both outputs together
            existingvalue = final_content[name]
            currentvalue = name
            res = strict_output(system_prompt = f'''You are a helpful assistant assistant meant to help the
                                SAP BTP expert to combine two sources of information and/or solutions 
                                together factually.
                                If you are not sure about any of the output fields, output {NO_INFO}"''',
                user_prompt = f'''Source 1: {existingvalue}, Source 2: {currentvalue}''', 
                output_format = output_format)
            print(f'Combining outputs for {name}\nConsolidated Output: {res}')
            final_content[name] = res
            
    # update the main dictionary with the information sources
    for key in final_content.keys():
        final_content[key]['info_sources'] = str(final_content_sources[key]).replace('\'',' ').replace('[','').replace(']','').replace(',','')

    # Curate final output to see if sources are relevant
    curated_final_content = {}
    for key, value in final_content.items():
        # res = strict_output(system_prompt = f'''You are a SAP BTP expert meant to see if a user 
        #                     input is relevant for the query: "{query}"
        #                     Output whether or not it is relevant.''',
        res = strict_output(system_prompt = f'''You are a SAP BTP expert meant to see if a user 
                            input is relevant for the task: "{btp_expert_task}", which is assigned to you
                            by your senior consultant previously.
                            Output whether or not it is relevant.''',
            user_prompt = f'''{value}''', 
            output_format = {"Relevance": ["3: user input solves almost all of the task assigned", 
                            "2: user input solves more than half of the task",
                            "1: user input solves at least one part of the task",
                            "0: user input does not solve any part of the task"]})
        if res == {}: continue
        value['Relevance'] = res['Relevance']
        curated_final_content[key] = value
        print(value)
        print(res['Relevance'])
        
        # Convert it into a document
        # Convert dictionary to Excel spreadsheet
        file_path = f'agent_debate_v4.xlsx'
        df = pd.DataFrame.from_dict(curated_final_content, orient = 'index')
        df = df.sort_values(by='Relevance', ascending=False)
        df.to_excel(file_path, index = False)