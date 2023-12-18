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
                            You are in the middle of a discussion with a customer and your team members have provided their solutions to the customer's consulting question. 
                            You have just provided your critique and refinement requests for both the team members. However, the customer has asked a follow-up question: {user_question}.
                            You need to address the question. The customer probably asked this question because the conversation is steering out of track. Help to steer the conversation back to the right track,
                            and provide new critique for the team members' solutions if necessary. If you don't think that the question is neccessary and out of topic, be firm and
                            explain to the customer why you think his question is out of topic. You should be firm yet answer politely, probably start with something like "That's a good question."
                            
                            Consulting question: {consulting_question}
                            Previous critique for Solutions Architect(if any): {critique_for_sa}
                            Previous critique for BTP Expert(if any): {critique_for_btp}
                            Solutions Architect's solution: {solutions_architect_output}
                            BTP Expert's solution: {btp_expert_output}''',
        user_prompt = f'''Here are the solutions provided by the team members for the task: "{combined_summary}.
                          Here are the critique and refinement requests you provided for the team members'solutions: "{combined_critique}.
                          Here is the follow-up question from the customer: {user_question}"''',
                          
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
