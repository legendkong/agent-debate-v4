from utils.openai_util import strict_output
from config.loadllm import token, svc_url

###############################
# SAP Lead Consultant Agent 
# Role: 
# 1. Receives a customer request as input.
# 2. Breaks the question down and scopes it.
# 3. Determines who does what and then splits the task amongst 
#    the SAP BTP expert and SAP Solutions Architect.
# 4. Outputs the task to the SAP BTP expert and SAP Solutions Architect.

# To-consider: Asking the customer for more information if the request is too vague.
###############################


# def gather_user_input():
#     #  Gather input from the user (representing the customer agent).
#     user_query = input("SAP Lead Consultant(15 years of experience): Hey there! Please ask your consulting question and let our team handle the rest:\n")
#     return user_query


def SAPSeniorConsultant(consulting_question):
    
    res = strict_output(system_prompt = f'''You are a SAP Lead Consultant with 15 years of experience. 
                        You work in a team of three; yourself as a planner/manager,and under you is
                        a SAP BTP expert and a SAP Solutions Architect.
                        You help to understand the needs and scope the customer's request 
                        and assign tasks to the SAP BTP expert and SAP Solutions Architect so that they 
                        can provide valuable advice to the customer. 
                        Given the customer's question of: {consulting_question}, help to summarize and scope
                        the customer's request and assign tasks to the SAP BTP expert and SAP Solutions Architect.''',
                        user_prompt = f'''Customer question: {consulting_question}''', 
                        output_format = {"Scope" : "Scope of the customer's request",
                                        "SAP BTP Expert Task": "Task for the BTP Expert", 
                                        "SAP Solutions Architect Task": "Task for the Solutions Architect"},
                        token=token,
                        svc_url=svc_url,
                        )
    scope = res['Scope']
    btp_scope = res['SAP BTP Expert Task']
    sa_scope = res['SAP Solutions Architect Task']    
    btp_expert_task = res['Scope'] + " " + res['SAP BTP Expert Task']
    solutions_architect_task = res['Scope'] + " " + res['SAP Solutions Architect Task']
    
    return scope, btp_expert_task, solutions_architect_task, btp_scope, sa_scope
    
if __name__ == "__main__":
    SAPSeniorConsultant()
