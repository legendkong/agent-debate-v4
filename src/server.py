from flask import Flask, jsonify, request
from flask_cors import CORS

# import agents
from agents.SAPSeniorConsultant import SAPSeniorConsultant
from agents.SAPSolutionsArchitect import SAPSolutionsArchitect
from agents.v2SAPSeniorConsultant import v2SAPSeniorConsultant
from agents.v2SAPSolutionsArchitect import v2SAPSolutionsArchitect
from agents.v2SAPBTPExpert import v2SAPBTPExpert
from agents.Moderator import Moderator
from agents.mockSAPBTPExpert import mockSAPBTPExpert
from agents.summarizeSeniorConsultant import summarizeSeniorConsultant
from agents.mermaidConverter import mermaidConverter
from agents.mermaidConverter2 import mermaidConverter2
from agents.v2Moderator import v2Moderator
from agents.v3SAPSeniorConsultant import v3SAPSeniorConsultant

app = Flask(__name__)
 # Enable CORS for all routes
allowed_origins = ["http://localhost:3000", "https://agent-frontend:3000", "http://agent-frontend:3000"]
CORS(app, resources={r"/*": {"origins": allowed_origins}})

@app.route('/')
def home():
    return "Welcome to the AGENT-DEBATE-V4 API!"

# After the user gives his consulting question, Lead Consultant will scope the question and assign tasks to the BTP expert and solutions architect.
@app.route('/api/senior_consultant_post', methods=['POST'])
def senior_consultant_post():
    data = request.get_json()
    consulting_question = data.get('consulting_question')

    if not consulting_question:
        return jsonify({"error": "No consulting question provided"}), 400

    scope, btp_expert_task, solutions_architect_task, btp_scope, sa_scope = SAPSeniorConsultant(consulting_question)
    
    return jsonify({
        'scope': scope,
        'btp_expert_task': btp_expert_task,
        'solutions_architect_task': solutions_architect_task,
        'btp_scope' : btp_scope,
        'sa_scope' : sa_scope
        
    })


# Solutions architect response
@app.route('/api/solutions_architect', methods=['POST'])
def solutions_architect():
    data = request.get_json()
    solutions_architect_task = data.get('solutions_architect_task')

    if not solutions_architect_task:
        return jsonify({"error": "No solutions architect task provided"}), 400

    # Now we process the solutions architect task
    result = SAPSolutionsArchitect(solutions_architect_task)
    return jsonify({
        'solutions_architect_result': result
    })
    

# MOCK BTP expert response
@app.route('/api/mock_btp_expert', methods=['POST'])
def mock_btp_expert():
    data = request.get_json()
    btp_expert_task = data.get('btp_expert_task')

    if not btp_expert_task:
        return jsonify({"error": "No btp expert task provided"}), 400

    # Assuming SAPBTPExpert function returns curated_final_content
    result = mockSAPBTPExpert(btp_expert_task)
    return jsonify({
        'btp_expert_result': result
    })

    
# (Give critique) v2 Lead Consultant response to solutions from BTP expert and solutions architect
@app.route('/api/v2_senior_consultant', methods=['POST'])
def api_v2_senior_consultant():
    data = request.get_json()
    btp_expert_output = data.get('btp_expert_output')
    solutions_architect_output = data.get('solutions_architect_output')
    consulting_question = data.get('consulting_question')
    critique_for_sa = data.get('critique_for_sa')
    critique_for_btp = data.get('critique_for_btp')
    
    overall_feedback, needs_refinement = v2SAPSeniorConsultant(
        consulting_question,
        solutions_architect_output,
        btp_expert_output,
        critique_for_sa,
        critique_for_btp
    )

    return jsonify({
        'overall_feedback': overall_feedback,
        'needs_refinement': needs_refinement
    })

    
@app.route('/api/refine_solutions_architect', methods=['POST'])
def refine_solutions_architect():
    data = request.get_json()
    previous_solution = data.get('previous_solution')
    critique = data.get('critique')
    solutions_architect_task = data.get('solutions_architect_task')

    if not all([previous_solution, critique, solutions_architect_task]):
        return jsonify({"error": "Missing data for refinement"}), 400

    refined_solution = v2SAPSolutionsArchitect(previous_solution, critique, solutions_architect_task)

    return jsonify({'refined_solutions_architect_result': refined_solution})

@app.route('/api/refine_btp_expert', methods=['POST'])
def refine_btp_expert():
    data = request.get_json()
    previous_solution = data.get('previous_solution')
    critique = data.get('critique')
    btp_expert_task = data.get('btp_expert_task')

    if not all([previous_solution, critique, btp_expert_task]):
        return jsonify({"error": "Missing data for refinement"}), 400

    refined_solution = v2SAPBTPExpert(previous_solution, critique, btp_expert_task)

    return jsonify({'refined_btp_expert_result': refined_solution})

    
# Moderator response
@app.route('/api/moderate_conversation', methods=['POST'])
def moderate_conversation():
    data = request.get_json()
    refinement_needed = data.get('refinement_needed', False)
    refinement_count = data.get('refinement_count', 0)
    
    print("Refinement needed:", refinement_needed)  # Debug print
    print("Refinement count:", refinement_count)  # Debug print


    message, allow_input = Moderator(refinement_needed, refinement_count)
    return jsonify({
        'message': message,
        'allow_input': allow_input
    })
    
# Summary provided by senior consultant
@app.route('/api/summarize', methods=['POST'])
def summarize():
    # Extract data from the request
    data = request.get_json()
    solutions_architect_output = data.get('solutions_architect_output')
    btp_expert_output = data.get('btp_expert_output')
    consulting_question = data.get('consulting_question')

    # Check if the necessary data is provided
    if not solutions_architect_output or not btp_expert_output:
        return jsonify({"error": "Missing required data"}), 400

    # Call the summarizeSeniorConsultant function
    summary = summarizeSeniorConsultant(solutions_architect_output, btp_expert_output, consulting_question)

    # Return the summary
    return jsonify({"summary": summary})

# Mermaid converter
@app.route('/api/convert_to_mermaid', methods=['POST'])
def convert_to_mermaid():
    # Extract the text from the request
    data = request.json
    text_description = data.get('text')

    if not text_description:
        return jsonify({'error': 'No text provided'}), 400

    # Call the mermaidConverter function
    try:
        mermaidSyntax = mermaidConverter(text_description)
        return jsonify({'mermaidSyntax': mermaidSyntax})
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    
# Mermaid converter 2
@app.route('/api/convert_to_mermaid2', methods=['POST'])
def convert_to_mermaid2():
    # Extract the text from the request
    data = request.json
    text_description = data.get('text')

    if not text_description:
        return jsonify({'error': 'No text provided'}), 400

    # Call the mermaidConverter function
    try:
        mermaidSyntax = mermaidConverter2(text_description)
        return jsonify({'mermaidSyntax': mermaidSyntax})
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/v2_moderator', methods=['POST'])
def handle_v2_moderation():
    data = request.get_json()
    user_input = data.get('user_input')
    print("User input:", user_input)

    question_asked, answer = v2Moderator(user_input)
    print("Question asked:", question_asked)
    print("Answer:", answer)

    return jsonify({
        'question_asked': question_asked,
        'answer': answer
    })

# (Address customer question) v3 Lead Consultant response to customer question and to solutions from BTP expert and solutions architect
@app.route('/api/v3_senior_consultant', methods=['POST'])
def api_v3_senior_consultant():
    data = request.get_json()
    btp_expert_output = data.get('btp_expert_output')
    solutions_architect_output = data.get('solutions_architect_output')
    consulting_question = data.get('consulting_question')
    critique_for_sa = data.get('critique_for_sa')
    critique_for_btp = data.get('critique_for_btp')
    user_question = data.get('user_question')

    overall_feedback, needs_refinement = v3SAPSeniorConsultant(
        consulting_question,
        solutions_architect_output,
        btp_expert_output,
        critique_for_sa,
        critique_for_btp,
        user_question
    )

    return jsonify({
        'overall_feedback': overall_feedback,
        'needs_refinement': needs_refinement
    })
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=8080)
