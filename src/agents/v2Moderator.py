from utils.openai_util import strict_output
from config.loadllm import token, svc_url
import re

def v2Moderator(user_input):
    
    review = strict_output(
        system_prompt = f'''You are a highly intelligent AI acting as a Moderator. Your task is to interpret user input in a conversation involving SAP consultancy. 
                            Your goal is to determine the nature of the user's input - whether it's a straightforward statement, a question, or a suggestion that implies a need for further information or action.
                            If the user is making a statement that includes any type of meaning that is equivalent to "no" or "nothing", output "no question".
                            If the user is asking a direct question, output the entire question as it is.
                            If the user is making a suggestion or a request that implies a question or a need for further information (e.g., "I am using Linux."), treat this as an implied question. 
                            Output the essence of the query or the action needed in response to the suggestion.
                            Remember, your role is to facilitate a smooth and effective consultation process by accurately identifying when further input, clarification, suggestion, or action is required.''',
        user_prompt = f'''This is the user input: "{user_input}."''',
        output_format = {"Interpretation": "Either no question, or the question/suggestion/statement itself"},
        token=token,
        svc_url=svc_url)
    
    answer = review.get('Interpretation', 'no question.')
    
    
  

    def any_question(question):
        # Remove punctuation for more robust comparison
        question_no_punctuation = re.sub(r'[^\w\s]', '', question.lower())
        return "no question" not in question_no_punctuation

    
    # determine if there is any question asked by user
    question_asked = any_question(answer)
    
    return question_asked, answer
