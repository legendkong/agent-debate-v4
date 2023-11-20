from utils.openai_util import strict_output
from config.loadllm import token, svc_url
from config.dependencies import *

def v2SAPSolutionsArchitect(previous_solution, critique, solutions_architect_task):
    # """
    # Revise the solution based on critique and provide an improved solution.
    
    # :param previous_solution: The previous solution provided by the Solutions Architect.
    # :param critique: The critique and requests for refinement from the Lead Consultant.
    # :param solutions_architect_task: The task for which the solution is being refined.
    # :return: The refined solution.
    # """
    
    # Assuming strict_output is a utility function you've defined that uses an AI or some complex logic to generate output.
    refined_solution = strict_output(
        system_prompt=f'''You are the SAP Solutions Architect revising your previous solution based on the 
                        feedback from the SAP Lead Consultant. Your previous solution was:
                        {previous_solution}
                        
                        The critique and refinement requests from the Lead Consultant were as follows:
                        {critique}
                        
                        The task assigned to you by the SAP Lead Consultant is:
                        {solutions_architect_task}
                        
                        Taking this into account, please provide a refined solution that addresses the critique.''',
        user_prompt=f'''Refinement task based on the critique: {critique}''',
        output_format={"Refined Solution": "Full description of the refined steps for the customer to execute"},
        token=token,
        svc_url=svc_url)

    refined_steps = refined_solution['Refined Solution']
    print(refined_steps)
    return refined_steps
