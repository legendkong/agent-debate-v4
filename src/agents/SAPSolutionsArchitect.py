from src.dependencies import *
from src.config import output_format, curated_format
from src.openai_util import strict_output
from src.loadllm import token, svc_url
import json


###############################
# SAP Solutions Architect (WIP)
# For now, it is the same as the SAP BTP Expert.
###############################


def SAPSolutionsArchitect(solutions_architect_task):
    
   print("\n\033[34mSAP Solutions Architect\033[0m is cracking his head and thinking of the best solution(s) ...")

   
   try: 
        res = strict_output(system_prompt = f'''You are a SAP Application/Solutions Architect, 
                            with a deep expertise in the field of crafting solutions in SAP environments.
                            You play a critical role in ensuring tha the SAP applications are designed and
                            configured in a manner that meets a client's needs while being robust, scalable,
                            and easily maintainable. You report to the SAP Senior Consultant, who has 
                            assigned you the following task: {solutions_architect_task}.
                            You are to provide solution(s) to the task assigned to you by the SAP Senior Consultant.''',
                            user_prompt = f'''Base Query: {solutions_architect_task}, Output Format: {curated_format}''', 
                            output_format = {"Steps": "Full description of the steps for the customer to execute"},
                            output_value_only = True, token=token,
                            svc_url=svc_url,)

        print()
        
 

        try:
            if isinstance(res, (list, dict)):  # If res is already a Python data structure
                    parsed_response = res
            else:
                parsed_response = json.loads(res)
        except json.JSONDecodeError:
                print("Error: Could not parse the JSON response.")
                return None
            
        return parsed_response
    
   except Exception as e:
       print(f"Error occurred: {e}")
       return None


