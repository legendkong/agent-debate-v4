from utils.openai_util import strict_output
from config.loadllm import token, svc_url

def v2SAPSeniorConsultant(consulting_question, solutions_architect_output, btp_expert_output, critique_for_sa, critique_for_btp):
    # """
    # Review the solutions provided by the BTP expert and Solutions Architect,
    # critique them, and ask for refinement if necessary.
    # """
    
    combined_summary = f"Solutions Architect provided: {solutions_architect_output}\n\n" \
                       f"BTP Expert provided: {btp_expert_output}"
    
    # Initial review process
    review = strict_output(
        system_prompt = f'''You are a SAP lead consultant. You lead a team of two people: the Solutions Architect and the BTP expert.
                            Review the consulting question by the customer and the 
                            following solutions provided by the Solutions Architect and BTP Expert 
                            and provide your critique. If the solutions need refinement, 
                            provide clear feedback on what needs to be changed. If there is no critique 
                            or refinement needed from either team member, state "No refinement needed.".
                            For example, if there is no critique or refinement needed for the BTP expert,
                            then "Critique for BTP Expert": "No refinement needed". 
                            You might have already provided critique and refinement requests for both the team members in the previous round, if so, review their new solutions
                            based on your previous critique and if you think that the solutions are good enough, state "No refinement needed" for that particular team member or both.
                            If the critique is "nil", it means that that this is the first time you review the solutions provided by the team members, and you are free to provide critique and refinement requests.
                            Consulting question: {consulting_question}
                            Previous critique for Solutions Architect(if any): {critique_for_sa}
                            Previous critique for BTP Expert(if any): {critique_for_btp}
                            Solutions Architect's solution: {solutions_architect_output}
                            BTP Expert's solution: {btp_expert_output}''',
        user_prompt = f'''Here are the solutions provided by the team members for the task: "{combined_summary}."''',
        output_format = {"Personal statement": "Your opinion on the solutions provided by the team members.",
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
