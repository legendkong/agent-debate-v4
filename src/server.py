from flask import Flask, jsonify, request
from flask_cors import CORS

# import agents
from agents.SAPSeniorConsultant import SAPSeniorConsultant
from agents.SAPSolutionsArchitect import SAPSolutionsArchitect
from agents.SAPBTPExpert import SAPBTPExpert

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


# @app.route('/api/solutions_architect', methods=['POST'])
# def solutions_architect_api():
#     # task = request.args.get('task')  # or request.json.get('task') if you're sending it as a JSON body
#     # task = request.json.get('task')
#     # task = request.args.get('task')
#     # if not task:
#     #     return jsonify({"error": "No task provided"}), 400
    
#     # result = SAPSolutionsArchitect(task)
#     # return jsonify(result)
#     data = request.get_json()
#     task = data.get('task')
#     if not task:
#         return jsonify({"error": "No task provided"}), 400
    
#     result = SAPSolutionsArchitect(task)
#     return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True, port=8080)
