from utils.openai_util import strict_output
from config.loadllm import token, svc_url
from config.dependencies import *
import re

def v2Moderator(user_input):
    
    review = strict_output(
        system_prompt = f'''You are a highly intelligent AI acting as a Moderator. Your task is to interpret user input in a conversation involving SAP consultancy. 
                            Based on the user's response, determine if they are asking a question or just making a statement. If they are making a statement, then output "no question".
                            If they are asking a question, output the entire question as it is.''',
        user_prompt = f'''This is the user input: "{user_input}."''',
        output_format = {"Interpretation": "Either no question, or the question itself"},
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