import os
from config.dependencies import *
from dotenv import load_dotenv
from agents.SAPSeniorConsultant import SAPSeniorConsultant

# Definition of a topic to be discussed
# topic = """
# The SAP customer has set up a MS SQL database which captures IoT data from sensors about a coal washery process. They use S/4HANA 2021 which is on-premise.
# This data contains information about consumed materials and their quantity during the washery process as well as by-products and the coal itself that is produced by it.
# The customer wants to use this data to confirm their S/4HANA Process Order through an API. The customer is interested to have a simple, stable and low cost solution to be set up.
# Outline the application architecture, API to be used and potential BTP services. Discuss in the team.
# """

# Load environment variables
load_dotenv()

# Access environment variables as follows:
api_key = os.getenv('CUSTOM_JSON_API_KEY')
cx = os.getenv('GOOGLE_PROGRAMMABLE_SEARCH_ENGINE')

def main():
    btp_expert_task = SAPSeniorConsultant()
    # SAPSolutionsArchitect(solutions_architect_task)
    
    
if __name__ == "__main__":
    main()
