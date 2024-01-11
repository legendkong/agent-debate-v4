from config.dependencies import *
from utils.openai_util import strict_output
from config.loadllm import token, svc_url

###############################
# Mock SAP BTP expert for faster testing
###############################


def mockSAPBTPExpert(btp_expert_task):
    
   print("\n\033[34mMock SAP BTP Expert\033[0m is cracking his head and thinking of the best solution(s) ...")

   
   res = strict_output(system_prompt = f'''You are a SAP BTP Expert, 
                            with a deep expertise in the field of crafting solutions in SAP environments.
                            You play a critical role in ensuring tha the SAP applications are designed and
                            configured in a manner that meets a client's needs while being robust, scalable,
                            and easily maintainable. You report to the SAP Lead Consultant, who has 
                            assigned you the following task: {btp_expert_task}.
                            You are to provide solution(s) to the task assigned to you by the SAP Lead Consultant.
                            Be more technical in your explanation. Quote the website of the source if there is any.''',
                            user_prompt = f'''Task assigned to you: {btp_expert_task}''', 
                            output_format = {"Solution": "Full description of the steps for the customer to execute"},
                            token=token,
                            svc_url=svc_url)
 
   steps = res['Solution']
   print(steps)
   return steps
