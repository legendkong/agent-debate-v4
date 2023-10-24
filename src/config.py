# Query format
query = 'SAP BTP information'

# Keywords to be contained in secondary sites.
# Will add url to list if any one matches. Secondary sites defined as links that are on the urls from Google Search
# If want to take out all secondary sites, set to empty list
keyword_list = ['btp', 'cloud platform', 'sap', 'help', 'cloud foundry', 'ABAP', 'Kyma']

# Unwanted url segments. Any url with these inside usually means proprietary sites, or irrelevant (job) sites
unwanted_url = []

# Number of secondary urls to extract each site. GPT will pick the most relevant ones
max_url_per_site = 3

# Number of google queries to search for. Increasing this increases the breadth of search, but we only have 100 searches a day
num_google_queries = 2

# Whether to take top 20 search results (default is 10)
twenty = False

# Output format. Key is the name of the spreadsheet header, Value is the description of what is to be there
# output_format = {
#     "Course Name": "Name of course",
#     "Course Website": "Website of course",
#     "Broad Course Description": "Description of course",
#     "Cost": "Amount of Money for Course",
#     "Time": "Expected amount of time",
#     "Venue": ["Physical <location>", "Online <website url>"],
#     "Company": "Company offering the course"
# }

output_format = {
    "Step Number" : "Information of the step",
    "Source" : "Source of information, including website source <website url> and date published",
}

# Base index. When doing the final table, what will be the reference to merge entries
base_index = "Step Number"
