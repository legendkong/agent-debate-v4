from flask import Flask, jsonify, request
from flask_cors import CORS

# import agents
from agents.SAPSeniorConsultant import SAPSeniorConsultant
from agents.SAPSolutionsArchitect import SAPSolutionsArchitect
from agents.SAPBTPExpert import SAPBTPExpert
from agents.v2SAPSeniorConsultant import v2SAPSeniorConsultant
from agents.v2SAPSolutionsArchitect import v2SAPSolutionsArchitect
from agents.v2SAPBTPExpert import v2SAPBTPExpert
from agents.Moderator import Moderator
from agents.mockSAPBTPExpert import mockSAPBTPExpert

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
 # Enable CORS for all routes

@app.route('/')
def home():
    return "Welcome to the AGENT-DEBATE-V4 API!"

# After the user gives his consulting question, senior consultant will scope the question and assign tasks to the BTP expert and solutions architect.
@app.route('/api/senior_consultant_post', methods=['POST'])
def senior_consultant_post():
    data = request.get_json()
    consulting_question = data.get('consulting_question')

    if not consulting_question:
        return jsonify({"error": "No consulting question provided"}), 400

    scope, btp_expert_task, solutions_architect_task = SAPSeniorConsultant(consulting_question)
    
    return jsonify({
        'scope': scope,
        'btp_expert_task': btp_expert_task,
        'solutions_architect_task': solutions_architect_task
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
    
# BTP expert response
@app.route('/api/btp_expert', methods=['POST'])
def btp_expert():
    data = request.get_json()
    btp_expert_task = data.get('btp_expert_task')

    if not btp_expert_task:
        return jsonify({"error": "No btp expert task provided"}), 400

    # Assuming SAPBTPExpert function returns curated_final_content
    result = SAPBTPExpert(btp_expert_task)

    # Return the first 'Steps' from the curated_final_content
    first_result_key = next(iter(result))
    first_result_steps = result[first_result_key].get('Steps', '')

    return jsonify({
        'btp_expert_result': first_result_steps
    })
    
# ******************** FOR FASTER TESTING ******************* #
# MOCK BTP expert response
@app.route('/api/mock_btp_expert', methods=['POST'])
def mock_btp_expert():
    data = request.get_json()
    btp_expert_task = data.get('btp_expert_task')

    if not btp_expert_task:
        return jsonify({"error": "No btp expert task provided"}), 400

    # Assuming SAPBTPExpert function returns curated_final_content
    result = mockSAPBTPExpert(btp_expert_task)

    # # Return the first 'Steps' from the curated_final_content
    # first_result_key = next(iter(result))
    # first_result_steps = result[first_result_key].get('Steps', '')

    return jsonify({
        'btp_expert_result': result
    })

    
# (Give critique) v2 Senior Consultant response to solutions from BTP expert and solutions architect
@app.route('/api/v2_senior_consultant', methods=['POST'])
def api_v2_senior_consultant():
    data = request.get_json()
    btp_expert_output = data.get('btp_expert_output')
    solutions_architect_output = data.get('solutions_architect_output')
    consulting_question = data.get('consulting_question')
    
    overall_feedback, needs_refinement = v2SAPSeniorConsultant(
        consulting_question,
        solutions_architect_output,
        btp_expert_output
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

    message, allow_input = Moderator(refinement_needed, refinement_count)
    return jsonify({
        'message': message,
        'allow_input': allow_input
    })






# # Refinement of solutions architect's output
# @app.route('/api/refine_solutions_architect', methods=['POST'])
# def refine_solutions_architect():
#     data = request.get_json()
#     critique = data.get('critique')
#     previous_output = data.get('previous_output')
    
#     # Logic to refine the solution architect's output
#     refined_output = some_refinement_function(previous_output, critique)
    
#     return jsonify({'refined_solution': refined_output})

# # Refinement of BTP expert's output
# @app.route('/api/refine_btp_expert', methods=['POST'])
# def refine_btp_expert():
#     data = request.get_json()
#     critique = data.get('critique')
#     previous_output = data.get('previous_output')
    
#     # Logic to refine the BTP expert's output
#     refined_output = some_other_refinement_function(previous_output, critique)
    
#     return jsonify({'refined_solution': refined_output})


if __name__ == '__main__':
    app.run(debug=True, port=8080)

