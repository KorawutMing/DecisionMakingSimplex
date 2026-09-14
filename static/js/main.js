/**
 * UI Controller Module - Coordinates all UI interactions
 */

import { api } from './api.js';
import { parsers } from './parsers.js';
import { GridGenerator } from './gridGenerator.js';
import { SimplexVisualizer } from './visualizer.js';
import { StepsRenderer } from './renderer.js';

export class UIController {
    constructor() {
        this.gridGenerator = new GridGenerator('grid-wrapper');
        this.visualizer = new SimplexVisualizer('simplex-canvas');
        this.renderer = new StepsRenderer('results', 'path-controls', 'x-select-1', 'x-select-2');
        
        this.currentMode = 'standard';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Initialize grid on load
        document.addEventListener('DOMContentLoaded', () => {
            this.regenerateGrid();
        });

        // Grid dimension changes
        document.getElementById('num_vars').addEventListener('change', () => this.regenerateGrid());
        document.getElementById('num_cons').addEventListener('change', () => this.regenerateGrid());
    }

    regenerateGrid() {
        const numVars = parseInt(document.getElementById('num_vars').value) || 0;
        const numCons = parseInt(document.getElementById('num_cons').value) || 0;
        
        // Default values for example
        const cValues = ['2', '4', '0', '0', 'M', 'M'];
        const aMatrix = [
            [1, 2, -1, 0, 1, 0],
            [-1, 2, 0, -1, 0, 1]
        ];
        const bValues = [4, 6];

        this.gridGenerator.generate(numVars, numCons, {
            cValues: cValues.slice(0, numVars),
            aMatrix: aMatrix.slice(0, numCons).map(row => row.slice(0, numVars)),
            bValues: bValues.slice(0, numCons)
        });
    }

    switchMode(mode) {
        const standardInput = document.getElementById('standard-input');
        const coptInput = document.getElementById('copt-input');
        const buttons = document.querySelectorAll('.mode-btn');
        
        buttons.forEach(btn => btn.classList.remove('active'));
        
        standardInput.classList.add('hidden');
        coptInput.classList.add('hidden');
        
        if (mode === 'standard') {
            standardInput.classList.remove('hidden');
            buttons[0].classList.add('active');
        } else if (mode === 'copt') {
            coptInput.classList.remove('hidden');
            buttons[1].classList.add('active');
        }
        
        this.currentMode = mode;
    }

    loadStandardExample(key) {
        const examples = {
            'default': {
                numVars: 6, numCons: 2, optType: 'min', rule: 'bland',
                cValues: ['2', '4', '0', '0', 'M', 'M'],
                bValues: [4, 6],
                aMatrix: [[1, 2, -1, 0, 1, 0], [-1, 2, 0, -1, 0, 1]]
            },
            'beaver': {
                numVars: 4, numCons: 2, optType: 'max', rule: 'bland',
                cValues: ['40', '50', '0', '0'],
                bValues: [40, 120],
                aMatrix: [[1, 2, 1, 0], [4, 3, 0, 1]]
            },
            'wyndor': {
                numVars: 5, numCons: 3, optType: 'max', rule: 'bland',
                cValues: ['3', '5', '0', '0', '0'],
                bValues: [4, 12, 18],
                aMatrix: [[1, 0, 1, 0, 0], [0, 2, 0, 1, 0], [3, 2, 0, 0, 1]]
            },
            'hw13': {
                numVars: 7, numCons: 3, optType: 'min', rule: 'bland',
                cValues: ['-0.75', '20', '-0.5', '6', '0', '0', '0'],
                bValues: [0, 0, 1],
                aMatrix: [
                    [0.25, -8, -1, 9, 1, 0, 0],
                    [0.5, -12, -0.5, 3, 0, 1, 0],
                    [0, 0, 1, 0, 0, 0, 1]
                ]
            }
        };

        const ex = examples[key];
        if (!ex) return;

        document.getElementById('num_vars').value = ex.numVars;
        document.getElementById('num_cons').value = ex.numCons;
        document.querySelector(`input[name="opt_type"][value="${ex.optType}"]`).checked = true;
        document.getElementById('pivot_rule').value = ex.rule;

        this.gridGenerator.generate(ex.numVars, ex.numCons, {
            cValues: ex.cValues,
            aMatrix: ex.aMatrix,
            bValues: ex.bValues
        });
    }

    loadCOPTExample(key) {
        const coptSamples = {
            'beaver': `Maximize
 OBJ: 40 x1 + 50 x2 + 0 x3 + 0 x4
Subject To
 C1: 1 x1 + 2 x2 + 1 x3 + 0 x4 = 40
 C2: 4 x1 + 3 x2 + 0 x3 + 1 x4 = 120
Bounds
 x1 >= 0
 x2 >= 0
 x3 >= 0
 x4 >= 0
End`,
            'wyndor': `Maximize
 OBJ: 3 x1 + 5 x2 + 0 x3 + 0 x4 + 0 x5
Subject To
 C1: 1 x1 + 0 x2 + 1 x3 + 0 x4 + 0 x5 = 4
 C2: 0 x1 + 2 x2 + 0 x3 + 1 x4 + 0 x5 = 12
 C3: 3 x1 + 2 x2 + 0 x3 + 0 x4 + 1 x5 = 18
Bounds
 x1 >= 0
 x2 >= 0
 x3 >= 0
 x4 >= 0
 x5 >= 0
End`,
            'hw6_1': `Minimize
 OBJ: 3 x1 + 5 x2 + 0 x3 + 0 x4 + 0 x5 + M x6 + M x7 + M x8
Subject To
 C1: 1 x1 + 1 x2 + 0 x3 + 0 x4 + 0 x5 + 1 x6 + 0 x7 + 0 x8 = 10
 C2: 1 x1 + 0 x2 - 1 x3 + 0 x4 + 0 x5 + 0 x6 + 1 x7 + 0 x8 = 5
 C3: 0 x1 + 1 x2 + 0 x3 - 1 x4 + 0 x5 + 0 x6 + 0 x7 + 1 x8 = 2
 C4: -1 x1 + 2 x2 + 0 x3 + 0 x4 + 1 x5 + 0 x6 + 0 x7 + 0 x8 = 2
Bounds
 x1 >= 0
 x2 >= 0
 x3 >= 0
 x4 >= 0
 x5 >= 0
 x6 >= 0
 x7 >= 0
 x8 >= 0
End`,
            'hw6_2': `Minimize
 OBJ: 2 x1 + 3 x2 + 1 x3 + 0 x4 + 0 x5 + 0 x6 + M x7 + M x8
Subject To
 C1: 1 x1 + 1 x2 + 2 x3 - 1 x4 + 0 x5 + 0 x6 + 1 x7 + 0 x8 = 4
 C2: 2 x1 + 1 x2 + 1 x3 + 0 x4 - 1 x5 + 0 x6 + 0 x7 + 1 x8 = 6
 C3: 1 x1 + 0 x2 + 1 x3 + 0 x4 + 0 x5 + 1 x6 + 0 x7 + 0 x8 = 10
Bounds
 x1 >= 0
 x2 >= 0
 x3 >= 0
 x4 >= 0
 x5 >= 0
 x6 >= 0
 x7 >= 0
 x8 >= 0
End`,
            'hw7_1': `Minimize
 OBJ: -10 x1 - 12 x2 - 12 x3 + 0 x4 + 0 x5 + 0 x6
Subject To
 C1: 1 x1 + 2 x2 + 2 x3 + 1 x4 + 0 x5 + 0 x6 = 20
 C2: 2 x1 + 1 x2 + 2 x3 + 0 x4 + 1 x5 + 0 x6 = 20
 C3: 2 x1 + 2 x2 + 1 x3 + 0 x4 + 0 x5 + 1 x6 = 20
Bounds
 x1 >= 0
 x2 >= 0
 x3 >= 0
 x4 >= 0
 x5 >= 0
 x6 >= 0
End`,
            'hw8_2': `Maximize
 OBJ: -5 x1 - 7 x2 + 0 x3 + 0 x4 - M x5 - M x6
Subject To
 C1: 1 x1 + 2 x2 + 0 x3 + 0 x4 + 1 x5 + 0 x6 = 1
 C2: 2 x1 + 0 x2 + 1 x3 + 0 x4 + 0 x5 + 0 x6 = 3
 C3: 2 x1 + 0 x2 + 0 x3 - 1 x4 + 0 x5 + 1 x6 = 1
Bounds
 x1 >= 0
 x2 >= 0
 x3 >= 0
 x4 >= 0
 x5 >= 0
 x6 >= 0
End`,
            'hw13_1': `Minimize
 OBJ: -0.75 x1 + 20 x2 - 0.5 x3 + 6 x4 + 0 x5 + 0 x6 + 0 x7
Subject To
 C1: 0.25 x1 - 8 x2 - 1 x3 + 9 x4 + 1 x5 + 0 x6 + 0 x7 = 0
 C2: 0.5 x1 - 12 x2 - 0.5 x3 + 3 x4 + 0 x5 + 1 x6 + 0 x7 = 0
 C3: 0 x1 + 0 x2 + 1 x3 + 0 x4 + 0 x5 + 0 x6 + 1 x7 = 1
Bounds
 x1 >= 0
 x2 >= 0
 x3 >= 0
 x4 >= 0
 x5 >= 0
 x6 >= 0
 x7 >= 0
End`
        };

        if (coptSamples[key]) {
            document.getElementById('copt_string').value = coptSamples[key];
        }
    }

    clearGrid() {
        this.gridGenerator.clear();
    }

    async solveFromGrid() {
        const button = document.querySelector('#standard-input button');
        const buttonText = document.getElementById('buttonText1');
        
        this.setButtonLoading(button, buttonText, true);

        try {
            const { c_T, A, b_T } = this.gridGenerator.extractData();
            
            const isMinimize = document.querySelector('input[name="opt_type"]:checked').value === 'min';
            const pivotRule = document.getElementById('pivot_rule').value;

            const payload = {
                c_T,
                A,
                b_T,
                is_minimize: isMinimize,
                pivot_rule: pivotRule
            };

            await this.solveProblem(payload, c_T);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            this.setButtonLoading(button, buttonText, false);
        }
    }

    async solveCOPTString() {
        const button = document.querySelector('#copt-input button');
        const buttonText = document.getElementById('buttonText3');
        
        this.setButtonLoading(button, buttonText, true);

        try {
            const coptString = document.getElementById('copt_string').value;
            const payload = parsers.parseCOPTString(coptString);
            
            await this.solveProblem(payload, payload.c_T);
        } catch (error) {
            alert(error.message);
        } finally {
            this.setButtonLoading(button, buttonText, false);
        }
    }

    async solveProblem(payload, cDisplay) {
        const data = await api.solve(payload);
        const path = this.renderer.render(data.steps, cDisplay);
        this.visualizer.setPath(path);
    }

    drawSimplexPath() {
        const varIndex1 = parseInt(document.getElementById('x-select-1').value);
        const varIndex2 = parseInt(document.getElementById('x-select-2').value);
        
        this.visualizer.draw(varIndex1, varIndex2);
    }

    setButtonLoading(button, buttonText, isLoading) {
        if (isLoading) {
            buttonText.innerHTML = '<span class="loading"></span>';
            button.disabled = true;
        } else {
            buttonText.textContent = 'Solve Problem';
            button.disabled = false;
        }
    }
}

// Make functions available globally for onclick handlers
window.uiController = new UIController();
window.switchMode = (mode) => window.uiController.switchMode(mode);
window.loadStandardExample = (key) => window.uiController.loadStandardExample(key);
window.loadCOPTExample = (key) => window.uiController.loadCOPTExample(key);
window.clearGrid = () => window.uiController.clearGrid();
window.solveFromGrid = () => window.uiController.solveFromGrid();
window.solveCOPTString = () => window.uiController.solveCOPTString();
window.drawSimplexPath = () => window.uiController.drawSimplexPath();

