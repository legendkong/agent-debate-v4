
from llm_commons.proxy.identity import AICoreProxyClient
from llm_commons.langchain.proxy import ChatOpenAI
from langchain.schema.messages import HumanMessage
import llm_commons.proxy.base
llm_commons.proxy.base.proxy_version = 'aicore'
messages = [
    HumanMessage(content="Are you gpt 4 or gpt 3?"),
]

aic_proxy_client = AICoreProxyClient()
aic_llm = ChatOpenAI(proxy_client=aic_proxy_client, proxy_model_name='gpt-4-32k')
print(aic_llm.invoke(messages))