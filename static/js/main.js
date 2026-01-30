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
        const stringInput = document.getElementById('tableau-input');
        const coptInput = document.getElementById('copt-input');
        const buttons = document.querySelectorAll('.mode-btn');
        
        buttons.forEach(btn => btn.classList.remove('active'));
        
        standardInput.classList.add('hidden');
        stringInput.classList.add('hidden');
        coptInput.classList.add('hidden');
        
        if (mode === 'standard') {
            standardInput.classList.remove('hidden');
            buttons[0].classList.add('active');
        } else if (mode === 'string') {
            stringInput.classList.remove('hidden');
            buttons[1].classList.add('active');
        } else if (mode === 'copt') {
            coptInput.classList.remove('hidden');
            buttons[2].classList.add('active');
        }
        
        this.currentMode = mode;
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

    async solveStandardizedString() {
        const button = document.querySelector('#tableau-input button');
        const buttonText = document.getElementById('buttonText2');
        
        this.setButtonLoading(button, buttonText, true);

        try {
            const problemString = document.getElementById('problem_string').value;
            const payload = parsers.parseStandardizedString(problemString);
            
            await this.solveProblem(payload, payload.c_T);
        } catch (error) {
            alert('Error parsing input: ' + error.message);
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
            alert('Parsing Error: ' + error.message);
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
window.solveFromGrid = () => window.uiController.solveFromGrid();
window.solveStandardizedString = () => window.uiController.solveStandardizedString();
window.solveCOPTString = () => window.uiController.solveCOPTString();
window.drawSimplexPath = () => window.uiController.drawSimplexPath();
