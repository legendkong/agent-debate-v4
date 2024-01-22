from config.dependencies import *
from utils.openai_util import strict_output
from config.loadllm import token, svc_url

###############################
# Mermaid converter 2 ***
# converts string text to mermaid diagram
###############################


def mermaidConverter2(text_description):
    
   print("\n\033[34mMermaid diagram\033[0m is being generated ...")

   
   res = strict_output(system_prompt = f''' You are a solutions architect, with a strong knowledge of 
                       charting system architecture diagrams.  Convert the following output that you've proposed previously into a well structured architecture diagram formatted for a Mermaid flowchart diagram:
                        Output: "{text_description}"''',
                            user_prompt = f'''Do not include any other information other than the 
                            mermaid syntax, because if the syntax is incorrect, Mermaid
                            will fail to parse and render it on the frontend.''', 
                            output_format = {"mermaidSyntax": "Mermaid diagram syntax based on the text"},
                            token=token,
                            svc_url=svc_url)
 
   mermaidSyntax = res['mermaidSyntax']
   return mermaidSyntax
