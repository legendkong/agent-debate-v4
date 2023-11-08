from flask import Flask, jsonify, request
from flask_cors import CORS

# Import your function
from agents.SAPSolutionsArchitect import SAPSolutionsArchitect
from agents.SAPSeniorConsultant import SAPSeniorConsultant

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
 # Enable CORS for all routes

@app.route('/')
def home():
    return "Welcome to the AGENT-DEBATE-V4 API!"

# @app.route('/api/solutions_architect', methods=['GET'])
# def solutions_architect_api():
#     # data = request.json
#     # task = data['task']
#     # result = SAPSolutionsArchitect(task)
#     # return jsonify(result)
#     return jsonify({
#         'message':"Hello World!"
#     })

# @app.route('/api/senior_consultant_get', methods=['GET'])
# def senior_consultant_get():
#     return jsonify({
#         'message':"GET: Hello World!"
#     })
    

@app.route('/api/senior_consultant_post', methods=['POST'])
def senior_consultant_post():
    data = request.get_json()
    consulting_question = data.get('consulting_question')

    if not consulting_question:
        return jsonify({"error": "No consulting question provided"}), 400

    btp_expert_task, solutions_architect_task = SAPSeniorConsultant(consulting_question)

    return jsonify({
        'btp_expert_task': btp_expert_task,
        'solutions_architect_task': solutions_architect_task
    })



@app.route('/api/solutions_architect', methods=['POST'])
def solutions_architect_api():
    # task = request.args.get('task')  # or request.json.get('task') if you're sending it as a JSON body
    # task = request.json.get('task')
    # task = request.args.get('task')
    # if not task:
    #     return jsonify({"error": "No task provided"}), 400
    
    # result = SAPSolutionsArchitect(task)
    # return jsonify(result)
    data = request.get_json()
    task = data.get('task')
    if not task:
        return jsonify({"error": "No task provided"}), 400
    
    result = SAPSolutionsArchitect(task)
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True, port=8080)
