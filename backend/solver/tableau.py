import numpy as np

class SimplexTableau:
    def __init__(self, c_TR, c_TM, b_T, A, x, basis, is_minimize=True, pivot_rule='bland'):
        self.c_TR = np.array(c_TR, dtype=float)
        self.c_TM = np.array(c_TM, dtype=float)
        self.b_T = np.array(b_T, dtype=float)
        self.A = np.array(A, dtype=float)
        self.x = np.array(x, dtype=float)
        self.basis = np.array(basis, dtype=int)
        self.is_minimize = is_minimize
        print(is_minimize)
        self.pivot_rule = pivot_rule
        
        self.num_rows, self.num_cols = self.A.shape
        
        # History to detect cycling (stores tuples of the basis)
        self.history = set()
        self._record_state()

        self.r_R = np.zeros(self.num_cols)
        self.r_M = np.zeros(self.num_cols)
        self.reduce_costs()

    def _record_state(self):
        """Saves the current basis to history. Returns False if already seen."""
        state = tuple(self.basis.tolist())
        if state in self.history:
            return False
        self.history.add(state)
        return True

    def reduce_costs(self):
        cb_R = self.c_TR[self.basis]
        cb_M = self.c_TM[self.basis]
        self.r_R = self.c_TR - np.dot(cb_R, self.A)
        self.r_M = self.c_TM - np.dot(cb_M, self.A)

    def check_optimal(self):
        multiplier = 1 if self.is_minimize else -1
        for j in range(self.num_cols):
            if multiplier * self.r_M[j] < -1e-9:
                return False
            if abs(self.r_M[j]) < 1e-9 and multiplier * self.r_R[j] < -1e-9:
                return False
        return True

    def _is_negative(self, val):
        return val < -1e-9

    def get_entering_variable(self):
        multiplier = 1 if self.is_minimize else -1
        best_col = -1
        # We store the 'best' as a tuple (M_val, R_val) to use lexicographical comparison
        best_val = (0.0, 0.0) 

        for j in range(self.num_cols):
            # Calculate the current variable's potential improvement
            curr_M = multiplier * self.r_M[j]
            curr_R = multiplier * self.r_R[j]

            # A variable is a candidate if (M < 0) OR (M == 0 and R < 0)
            is_candidate = self._is_negative(curr_M) or (abs(curr_M) < 1e-9 and self._is_negative(curr_R))

            if is_candidate:
                if self.pivot_rule == "bland":
                    # Bland's rule: just take the first index that qualifies
                    if best_col == -1 or j < best_col:
                        best_col = j
                else:
                    # "Most Negative" rule: Compare (M, R) tuples
                    # Python compares tuples element by element: (a, b) < (c, d)
                    if best_col == -1 or (curr_M, curr_R) < best_val:
                        best_val = (curr_M, curr_R)
                        best_col = j

        return best_col

    def iterate(self):
        if self.check_optimal():
            return "OPTIMAL"

        pivot_col = self.get_entering_variable()
        if pivot_col == -1: return "OPTIMAL"

        # Ratio test
        ratios = []
        for i in range(self.num_rows):
            if self.A[i, pivot_col] > 1e-9:
                ratios.append(self.b_T[i] / self.A[i, pivot_col])
            else:
                ratios.append(np.inf)
        
        min_ratio = np.min(ratios)
        if min_ratio == np.inf:
            raise ValueError("Problem is unbounded.")

        # Check for degeneracy: if multiple rows have the same minimum ratio
        # or if the minimum ratio is 0.
        if min_ratio < 1e-9:
            print(f"⚠️ Degenerate step detected (Ratio = 0 at pivot column {pivot_col})")

        pivot_row = np.argmin(ratios)
        
        # Perform Pivoting
        pivot_val = self.A[pivot_row, pivot_col]
        self.A[pivot_row, :] /= pivot_val
        self.b_T[pivot_row] /= pivot_val
        
        for i in range(self.num_rows):
            if i != pivot_row:
                factor = self.A[i, pivot_col]
                self.A[i, :] -= factor * self.A[pivot_row, :]
                self.b_T[i] -= factor * self.b_T[pivot_row]
        
        # Update Basis
        self.basis[pivot_row] = pivot_col
        
        # Check for Cycling
        if not self._record_state():
            raise RuntimeError("Cycling detected! The algorithm has returned to a previous basis.")
            
        self.reduce_costs()
        return "CONTINUE"

    def get_current_solution(self):
        sol = np.zeros(self.num_cols)
        for i, col_idx in enumerate(self.basis):
            sol[col_idx] = self.b_T[i]
        return sol
    
    def get_tableau_data(self):
        def clean_val(v):
            """Returns an int if the float has no decimal part, else keeps float."""
            return int(v) if float(v).is_integer() else round(float(v), 4)

        sol = self.get_current_solution()
        
        # Calculate Z values
        obj_R = float(np.dot(self.c_TR, sol))
        obj_M = float(np.dot(self.c_TM, sol))
        
        # Calculate NEXT pivot
        p_col = self.get_entering_variable()
        p_row = -1
        if p_col != -1:
            ratios = [self.b_T[i]/self.A[i, p_col] if self.A[i, p_col] > 1e-9 else np.inf for i in range(self.num_rows)]
            if min(ratios) != np.inf:
                p_row = int(np.argmin(ratios))

        return {
            "A": [[clean_val(v) for v in row] for row in self.A.tolist()],
            "b": [clean_val(v) for v in self.b_T.tolist()],
            "r_R": [clean_val(v) for v in self.r_R.tolist()],
            "r_M": [clean_val(v) for v in self.r_M.tolist()],
            "basis": self.basis.tolist(),
            "neg_obj_R": clean_val(-obj_R),
            "neg_obj_M": clean_val(-obj_M),
            "next_pivot": [p_row, p_col]
        }