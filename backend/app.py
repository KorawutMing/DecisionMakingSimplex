from flask import Flask, request, jsonify, render_template
from flask_cors import CORS  # Added for browser security
import numpy as np
from solver.tableau import SimplexTableau

app = Flask(__name__, 
            static_folder='../static', 
            template_folder='../templates')
CORS(app) # Enable CORS for all routes

@app.route('/')
def index():
    return render_template('index.html') # Serves your new UI

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    
    # 1. Pre-processing
    c_T_raw = [str(c).strip().replace(" ", "") for c in data['c_T']]

    c_TR = [0.0 if 'M' in c else float(c) for c in c_T_raw]
    c_TM = [1.0 if c == 'M' else (-1.0 if c == '-M' else 0.0) for c in c_T_raw]
    
    A = np.array(data['A'], dtype=float)
    b_T = np.array(data['b_T'], dtype=float)
    is_minimize = data.get('is_minimize', True) 
    pivot_rule = data.get('pivot_rule', 'bland')
    
    # 2. Find Initial Basis (Identity Columns)
    num_rows, num_cols = A.shape
    basis = [-1] * num_rows
    for j in range(num_cols):
        col = A[:, j]
        if np.sum(col == 1) == 1 and np.sum(col == 0) == (num_rows - 1):
            row_idx = np.where(col == 1)[0][0]
            if basis[row_idx] == -1: 
                basis[row_idx] = j
    
    # Safety Check: Ensure a full basis was found
    if -1 in basis:
        return jsonify({"error": "Initial basis not found. Check your identity columns."}), 400

    # 3. Initialize Starting x
    x = np.zeros(num_cols)
    for i, idx in enumerate(basis): 
        x[idx] = b_T[i]

    # 4. Initialize Solver and Capture Iterations
    try:
        # Pass the extracted variables here:
        tableau = SimplexTableau(
            c_TR, c_TM, b_T, A, x, basis, 
            is_minimize=is_minimize, 
            pivot_rule=pivot_rule
        )
        
        steps = [tableau.get_tableau_data()]

        max_iter = 50
        for _ in range(max_iter):
            if tableau.check_optimal():
                break
            
            status = tableau.iterate()
            steps.append(tableau.get_tableau_data()) # Call the correct method name
            
            if status == "OPTIMAL":
                break

        return jsonify({"steps": steps})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)