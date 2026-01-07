import numpy as np

def preprocess_big_m(c_T_raw, M_symbol='M'):
    """Converts raw objective list with 'M' strings into split NumPy arrays."""
    c_TR = np.array([float(c) if c != M_symbol else 0.0 for c in c_T_raw])
    c_TM = np.array([1.0 if c == M_symbol else 0.0 for c in c_T_raw])
    return c_TR, c_TM

def array_to_latex(matrix):
    """Converts a numpy array to a LaTeX bmatrix string for frontend rendering."""
    lines = ["\\begin{bmatrix}"]
    for row in matrix:
        lines.append(" & ".join([f"{val:.2f}" for val in row]) + " \\\\")
    lines.append("\\end{bmatrix}")
    return "\n".join(lines)

def generate_tableau_latex(tableau):
    """Generates a full LaTeX string for the current Simplex iteration."""
    # Build the top row: labels for columns
    # Build the main body: A matrix and b vector
    # Build the bottom rows: r_M and r_R
    latex = r"\begin{array}{c|cc|c} "
    # ... logic to format the arrays into LaTeX strings ...
    latex += r"\end{array}"
    return latex