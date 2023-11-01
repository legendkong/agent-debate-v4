# agent-debate-v4 (WIP)

<img src="/mdimages/agent_debate_v4_agent_overview.png" width="1000"> <br>

## Description

agent-debate-v4 aims to automate consultancy in the not so distant future.
By orchestrating a collaborative effort among specialized agents with domain knowledge of particular topics, this app promises precise, well-researched solutions to user-provided problem statements in the realm of SAP consultancy.

Here's how it unfolds:

1. **Customer Engagement**: Users present their SAP-related challenges to the virtual SAP Senior Consultant Agent.
2. **Problem Decomposition**: The consultant agent meticulously dissects the problem, assigning specific tasks to the SAP BTP Expert Agent and the SAP Solutions Architect Agent.
3. **Research and Relevance**: These agents delve into a web-wide exploration, seeking the most pertinent information to address the allocated tasks.
4. **Solution Synthesis**: The findings are funneled back to the senior consultant agent, who refines, critiques, and once content, dispatches a well-curated solution back to the customer.

By bridging domain expertise with automated, web-sourced research, Agent-Debate-v4 is not just a mock-up but a stepping stone towards a new era of digital consultancy.

## Agents

For this specific scenario, the agents involved are:

1. SAP Senior Consultant
2. SAP BTP Expert
3. SAP Solutions Architect

## SAP Senior Consultant

The SAP Senior Consultant will accept and understand the customer's problem statement. It will then allocate tasks relevant to the SAP BTP Expert and SAP Solutions Architect for them to carry out their research on.

One example customer's problem statement could be this:

```
I have set up a MS SQL database which captures IoT data from sensors about a coal washery process. We use S/4HANA 2021 which is on-premise. The database contains information about consumed materials and their quantity during the washery process as well as by-products and the coal itself that is produced by it. I want to use this data to confirm our S/4HANA Process Order through an API. I want to have a simple, stable and low cost solution to be setup. I want to know the application architecture, API to be used and the potential BTP services.
```

The SAP Senior Consultant will scope the problem, then decompose the problem statement into the following tasks:

```
SAP Senior Consultant: The customer wants to use the data from their MS SQL database to confirm S/4HANA Process Orders through an API. They are looking for a simple, stable, and low-cost solution. They also want to know the application architecture, API to be used, and potential BTP services.

1. Task for the BTP Expert: The SAP BTP expert needs to evaluate the customer's requirements and recommend the appropriate BTP services that can be used to integrate the MS SQL database with S/4HANA. They should also identify the API that can be used to confirm the Process Orders.

2. Task for the Solutions Architect: The SAP Solutions Architect needs to design the application architecture that will enable the integration between the MS SQL database and S/4HANA. They should consider the scalability, stability, and cost-effectiveness of the solution while designing the architecture.
```

The SAP Senior Consultant will then send the tasks to the SAP BTP Expert and SAP Solutions Architect.

## SAP BTP Expert

The SAP BTP Expert will receive the task from the SAP Senior Consultant and will then carry out the following steps:

1. Generates x best queries to prepare for google search
   <img src="/mdimages/btpexpert_step1.png" width="1000"> <br>
2. Finds list of primary sources from google search
3. Finds list of secondary sources from scraping "a href" tag
   <img src="/mdimages/btpexpert_step2.png" width="1000"> <br>
4. Filter secondary sources using gpt
5. Extracts relevant information according to task given by Senior Consultant
   <img src="/mdimages/btpexpert_step5.png" width="1000"> <br>
   . <br>
   . <br>
   . <br>
   <img src="/mdimages/btpexpert_step5a.png" width="1000"> <br>
6. Uses gpt to combine information from same site
7. Uses gpt to rank relevance of scraped sites
8. Outputs scraped sites and their information in order of relevance
   An example of the relevant information extracted from the secondary sources, ranked in order of relevance:
   <img src="/mdimages/btpexpert_results_excel.png" width="1000"> <br>
   _Note: Excel sheet is used purely for better visualization of the data for this `README.md`._

Example Results from BTP Expert:

```
1. Use SAP Integration Suite to integrate the MS SQL database with S/4HANA. This suite simplifies the integration of diverse applications and systems, enabling seamless data flow across the organization.
2. Install and connect the Cloud connector to the SAP BTP account if an on-premise system is involved.
3. Check the availability of S/4HANA APIs for process order confirmation.
4. Store the IoT data required for auto-posting in the MSSQL Server.
5. Manually adjust or request IT to adjust the frequency of auto-posting.
6. Leverage the SAP Integration Suite to automate the process order confirmation, which will result in improved efficiency and cost reduction in manual efforts.
7. Streamline the process by bringing different complex processes under one unified platform using the SAP Integration Suite.
8. Refer to the provided references for additional information on connecting MSSQL server from SAP Integration Suite and handling X-CSRF token with on-premises SAP system using HTTP Receiver Adapter.
```

This result is then sent back to the SAP Senior Consultant.

## SAP Solutions Architect

Likewise for the SAP Solutions Architect, the SAP Senior Consultant will send the task to the SAP Solutions Architect, who will then carry out the same steps as the SAP BTP Expert. A toggle will be enabled in the future to enable whether the agent is restricted to only SAP websites or not (if not it can roam free with the gpt api).

## Back to the SAP Senior Consultant (WIP)

The results from both SAP BTP Expert and SAP Solutions Architect will be sent back to the SAP Senior Consultant, who will then combine the results, critics it if needed, and add additional information before sending it back to the customer.
