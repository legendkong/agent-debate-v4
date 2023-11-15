from utils.openai_util import strict_output
from config.loadllm import token, svc_url
from config.dependencies import *

# def Moderator(messages):
#     # """
#     # Analyze the conversation and determine if further user input should be allowed.
    
#     # :param messages: A list of messages in the conversation so far.
#     # :return: A decision on whether further user input is allowed.
#     # """

#     # Construct a prompt to analyze the conversation
#     conversation_summary = "\n".join([f"{msg['sender']}: {msg['text']}" for msg in messages])

#     # Assuming strict_output uses AI to generate a response based on the conversation context
#     moderation_decision = strict_output(
#         system_prompt=f'''Given the following conversation, determine if the user should be allowed to continue 
#                         inputting questions or if the conversation should be concluded. 
#                         Here is the conversation so far:
#                         {conversation_summary}''',
#         user_prompt=f'''Analyze this conversation: {conversation_summary}''',
#         output_format={"Decision": "Yes, allow further input" or "No, conclude conversation"},
#         token=token,
#         svc_url=svc_url)

#     def evaluate_conversation(refinement_needed, refinement_count):
#         if not refinement_needed:
#             return "All team members of the SAP consultancy team have spoken and given their pointers."
#         elif refinement_count > 2:
#             return "The consultancy team has done more than two rounds of refinement. If the solution does not answer your problem statement, perhaps you could rephrase your problem statement or break it down to simpler points."
#         else:
#             return ""


#     decision = moderation_decision.get('Decision', 'Yes, allow further input')
#     allow_input = decision == "Yes, allow further input"
#     return allow_input


def Moderator(refinement_needed, refinement_count):
    """
    Determine if the conversation should be concluded based on refinement needs and count.

    :param refinement_needed: Boolean indicating if refinement is needed in the current round.
    :param refinement_count: Integer count of how many times refinement has occurred.
    :return: A message indicating the conversation's status and if further input is allowed.
    """

    # If no refinement is needed, conclude the conversation
    if not refinement_needed:
        return ("All team members of the SAP consultancy team have spoken and given their pointers.", False)

    # If more than two rounds of refinement have occurred, suggest rephrasing or breaking down the problem
    elif refinement_count > 2:
        return ("The consultancy team has done more than two rounds of refinement. If the solution does not answer your problem statement, perhaps you could rephrase your problem statement or break it down to simpler points.", False)

    # Otherwise, allow the conversation to continue
    else:
        return ("", True)

# Example usage
# message, allow_input = Moderator(refinement_needed=True, refinement_count=3)
