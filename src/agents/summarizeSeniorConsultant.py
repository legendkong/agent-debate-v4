from utils.openai_util import strict_output
from config.loadllm import token, svc_url

def summarizeSeniorConsultant(solutions_architect_output, btp_expert_output, consulting_question):
    """
    Summarize the final outputs provided by the BTP expert and Solutions Architect based on the consulting question.

    :param solutions_architect_output: The final solution provided by the Solutions Architect.
    :param btp_expert_output: The final solution provided by the BTP Expert.
    :param consulting_question: The initial consulting question from the customer.
    :return: A summary of the key points and insights from both solutions in the context of the consulting question.
    """

    combined_solutions = f"Solutions Architect provided: {solutions_architect_output}\n\n" \
                         f"BTP Expert provided: {btp_expert_output}\n\n" \
                         f"Consulting Question: {consulting_question}"

    # Generate a summary of the combined solutions
    summary = strict_output(
        system_prompt=f'''As an experienced SAP Senior Consultant, summarize the key points and insights from the solutions 
                          provided by the Solutions Architect and BTP Expert, considering the customer's consulting question.
                          Here are the details:\n{combined_solutions}''',
        user_prompt=f'''Summarize the key points from these solutions, considering the customer's question: {consulting_question}''',
        output_format={"Summary": "Key points and insights from the combined solutions."},
        token=token,
        svc_url=svc_url)

    # Extract the generated summary
    summarized_output = summary.get('Summary', 'No summary provided.')

    return summarized_output

