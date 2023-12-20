# Query format
# query = 'SAP BTP related information'
import llm_commons.langchain as proxy

# Keywords to be contained in secondary sites.
# Will add url to list if any one matches. Secondary sites defined as links that are on the urls from Google Search
# If want to take out all secondary sites, set to empty list ['']
keyword_list = ['sap', 'blogs', 'btp', 'help' 'cloud', 'hana', 'abap','fiori', 'sapbtp', 'sap btp', 'sap cloud platform', 'sap cloud', 'sap hana', 'sap abap', 'sapui5', 'sap fiori', 'api']

# Unwanted url segments. Any url with these inside usually means proprietary sites, or irrelevant (job) sites
unwanted_url = ['news', 'linkedin', 'instagram', 'twitter', 'youtube', 'facebook', 'indeed', 'glassdoor', 'monster', 'career', 'job', 'jobs', 'recruit', 'recruitment', 'recruiter', 'hiring', 'apply', 'career', 'people']

# Number of secondary urls to extract each site. GPT will pick the most relevant ones
max_url_per_site = 1

# Number of google queries to search for. Increasing this increases the breadth of search, but we only have 100 searches a day
num_google_queries = 1

# Whether to take top 20 search results (default is 10)
twenty = False

output_format = {
    "Step Number" : "Summary of the step",
    "Description" : "A full description of the step",
    "Source website": "Website of source"
}

    

curated_format = {
    "Source": "Source website url",
    "Steps": "Full description of the steps for the customer to execute in order to solve the problem"
    }

# Base index. When doing the final table, what will be the reference to merge entries
base_index = "Source"
