from utils.openai_util import strict_output
from config.loadllm import token, svc_url
from config.dependencies import *

def Moderator(refinement_needed, refinement_count):
    """
    Determine if the conversation should be concluded based on refinement needs and count.

    :param refinement_needed: Boolean indicating if refinement is needed in the current round.
    :param refinement_count: Integer count of how many times refinement has occurred.
    :return: A message indicating the conversation's status and if further input is allowed.
    """

    # If no refinement is needed, conclude the conversation
    if not refinement_needed:
        return ("All team members of the SAP consultancy team have spoken and given their pointers. You may proceed to try the above solutions proposed by the members of the SAP consultancy team. If there are any other queries, please ask away.", False)

    # If more than two rounds of refinement have occurred, suggest rephrasing or breaking down the problem
    elif refinement_count > 3:
        return ("The consultancy team has done more than two rounds of refinement. If the solution does not answer your problem statement, perhaps you could rephrase your problem statement or break it down to simpler points.", False)

    # Otherwise, allow the conversation to continue
    else:
        return ("", True)

# Example usage
# message, allow_input = Moderator(refinement_needed=True, refinement_count=3)
