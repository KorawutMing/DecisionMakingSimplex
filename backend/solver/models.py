from dataclasses import dataclass
from typing import List, Optional

@dataclass
class SimplexRequest:
    c_TR: List[float]
    c_TM: List[float]
    A: List[List[float]]
    b_T: List[float]
    initial_x: List[float]
    initial_basis: List[int]
    is_minimize: bool = True
    pivot_rule: str = 'bland'

@dataclass
class TableauStep:
    iteration: int
    matrix_A: List[List[float]]
    rhs_b: List[float]
    reduced_costs_R: List[float]
    reduced_costs_M: List[float]
    basis: List[int]
    current_x: List[float]
    obj_R: float
    obj_M: float
    status: str