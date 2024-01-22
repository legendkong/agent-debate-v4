from utils.openai_util import strict_output
from config.loadllm import token, svc_url
from config.dependencies import *

def v3SAPSeniorConsultant(consulting_question, solutions_architect_output, btp_expert_output, critique_for_sa, critique_for_btp, user_question):
    
    combined_summary = f"Solutions Architect provided: {solutions_architect_output}\n\n" \
                       f"BTP Expert provided: {btp_expert_output}"
                       
    combined_critique = f"Critique for Solutions Architect: {critique_for_sa}\n\n" \
                        f"Critique for BTP Expert: {critique_for_btp}"
                        
    # Initial review process
    review = strict_output(
        system_prompt = f'''You are a SAP lead consultant. You lead a team of two people: the Solutions Architect and the BTP expert.
                            The team is in a discussion with a customer, addressing a consulting question. You've critiqued the team's solutions and is now faced with a follow-up question or suggestion from the customer: "{user_question}". 
                            Review the customer's follow-up question and assign additional critiques or refinement requests for the Solutions Architect and/or BTP expert.
                            If the customer's input seems off-topic and completely unrelated to the original consulting question: "{consulting_question}", politely clarify why it doesn't align with the discussion. 
                            If the solutions need refinement, provide clear feedback on what needs to be changed.
                            Provide clear feedback to the solutions architect and btp expert on what needs to be changed, to address the customer's question.
                            If there is no critique or refinement needed from either team member, state "No refinement needed.".
                            For example, if there is no critique or refinement needed for the BTP expert, then "Critique for BTP Expert": "No refinement needed". 
                            
                            This is the original consulting question asked by the customer:"{consulting_question}"
                            This is the solution provided by the Solutions Architect: "{solutions_architect_output}"
                            This is the solution provided by the BTP Expert: "{btp_expert_output}"
                            This was the previous critique from you to the Solutions Architect, if any: "{critique_for_sa}"
                            This was the previous critique from you to the BTP Expert, if any: "{critique_for_btp}"
                            This is the new follow-up customer question: "{user_question}"
                            ''',
                            
        user_prompt = f'''Here are the combined solutions provided by the team members for the task: "{combined_summary}.
                          Here are the critique and refinement requests you provided earlier for the team members'solutions: "{combined_critique}.
                          Here is the follow-up question or suggestion from the customer: {user_question}"''',
                          
        output_format = {"Personal statement": "Your address to the customer's follow-up question.",
                         "Critique for Solutions Architect": "Feedback and refinement requests for the Solutions Architect.",
                         "Critique for BTP Expert": "Feedback and refinement requests for the BTP Expert."},
        token=token,
        svc_url=svc_url)

    # Extract the critique and feedback for each role
    personal_statement = review.get('Personal statement', 'No personal statement provided.')
    critique_for_sa = review.get('Critique for Solutions Architect', '')
    critique_for_btp = review.get('Critique for BTP Expert', '')
    
    
    def needs_refinement(critique):
        return "no refinement needed" not in critique.lower()
    
    # Determine if refinement is needed
    refinement_needed_sa = needs_refinement(critique_for_sa)
    refinement_needed_btp = needs_refinement(critique_for_btp)
    
    
    # Compile the overall feedback including the personal statement
    overall_feedback = {
        'Personal statement': personal_statement,
        'Critique for Solutions Architect': critique_for_sa,
        'Critique for BTP Expert': critique_for_btp
    }

    # Determine if either role needs to perform refinement
    needs_refinement = refinement_needed_sa or refinement_needed_btp

    # Return the structured feedback and a flag indicating if refinement is needed
    return overall_feedback, needs_refinement
