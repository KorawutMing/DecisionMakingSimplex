/**
 * Renderer Module - Handles rendering of solution steps
 */

import { formatters } from './formatters.js';

export class StepsRenderer {
    constructor(containerId, pathControlsId, varSelect1Id, varSelect2Id) {
        this.container = document.getElementById(containerId);
        this.pathControls = document.getElementById(pathControlsId);
        this.varSelect1 = document.getElementById(varSelect1Id);
        this.varSelect2 = document.getElementById(varSelect2Id);
        this.simplexPath = [];
        this.numDecisionVars = 0;
    }

    /**
     * Render all solution steps
     * @param {Array} steps - Solution steps from backend
     * @param {Array} originalC - Original objective coefficients
     */
    render(steps, originalC) {
        this.simplexPath = [];
        this.numDecisionVars = originalC.length;

        // Clear container
        this.container.innerHTML = `
            <h2>Solution Iterations</h2>
        `;

        const numVars = originalC.length;
        
        // Prepare initial step
        const initialStep = this._prepareInitialStep(steps[0], originalC);
        const allSteps = [initialStep, ...steps];

        // Render each step
        allSteps.forEach((step, index) => {
            this._renderStep(step, index, numVars);
        });

        // Setup path controls
        this._setupPathControls(this.numDecisionVars);

        return this.simplexPath;
    }

    _prepareInitialStep(firstStep, originalC) {
        const numVars = originalC.length;
        
        const initial_r_R = originalC.map(val => 
            val.includes('M') ? 0 : parseFloat(val) || 0
        );
        
        const initial_r_M = originalC.map(val => {
            if (!val.includes('M')) return 0;
            if (val === 'M') return 1;
            if (val === '-M') return -1;
            return parseFloat(val.replace('M', '')) || 0;
        });

        return {
            label: "Initial Tableau (Pre-reduction)",
            basis: firstStep.basis,
            A: firstStep.A,
            b: firstStep.b,
            r_R: initial_r_R,
            r_M: initial_r_M,
            neg_obj_R: 0,
            neg_obj_M: 0,
            next_pivot: [-1, -1]
        };
    }

    _renderStep(step, index, numVars) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-card';
        
        const title = index === 0 ? step.label : `Step ${index - 1}`;
        const [pRow, pCol] = step.next_pivot;
        
        // Calculate BFS values
        const xValues = Array(numVars).fill(0);
        step.basis.forEach((varIdx, rowIdx) => {
            if (varIdx < numVars) {
                xValues[varIdx] = step.b[rowIdx];
            }
        });
        this.simplexPath.push([...xValues]);

        // Identify variable roles
        const leavingVarIdx = pRow !== -1 ? step.basis[pRow] : -1;
        const stayingBasisIdxs = step.basis.filter((_, i) => i !== pRow);

        // Build table
        const tableHtml = this._buildTableHtml(step, numVars, xValues, pRow, pCol, leavingVarIdx, stayingBasisIdxs);
        
        // Build analysis
        const analysisHtml = this._buildAnalysisHtml(index, pRow, pCol, leavingVarIdx);

        stepDiv.innerHTML = `<h3>${title}</h3>` + tableHtml + analysisHtml;
        this.container.appendChild(stepDiv);
    }

    _buildTableHtml(step, numVars, xValues, pRow, pCol, leavingVarIdx, stayingBasisIdxs) {
        let html = `<table>`;
        
        // Variable Header Row with decorations
        html += `<tr class="header-row">
            <td style="font-weight:bold;">Variable</td>`;
        
        for (let j = 0; j < numVars; j++) {
            let decorator = "";
            if (j === pCol) decorator = "\u0302";        // Hat - Entering
            else if (j === leavingVarIdx) decorator = "\u030C"; // Caron - Leaving
            else if (stayingBasisIdxs.includes(j)) decorator = "\u0304"; // Bar - Basis
            
            html += `<td style="font-size: 1.2em;">x${decorator}<sub>${j+1}</sub></td>`;
        }
        html += `</tr>`;

        // BFS Values Row
        html += `<tr>
            <td style="font-weight:bold; background: #f1f1f1;">x values:</td>
            ${xValues.map(val => `<td>${formatters.smartFormat(val)}</td>`).join('')}
        </tr>`;

        // Objective Row
        html += `<tr class="obj-row">
            <td>${formatters.formatReducedCost(step.neg_obj_R, step.neg_obj_M)}</td>
            ${step.r_R.map((r, i) => 
                `<td>${formatters.formatReducedCost(r, step.r_M[i])}</td>`
            ).join('')}
        </tr>`;

        // Constraint Matrix
        step.A.forEach((row, i) => {
            html += `<tr>
                <td class="rhs-column">${formatters.smartFormat(step.b[i])}</td>
                ${row.map((val, j) => {
                    const isPivot = (pRow === i && pCol === j);
                    return `<td>
                        ${formatters.smartFormat(val)}
                        ${isPivot ? '<span class="pivot-marker">★</span>' : ''}
                    </td>`;
                }).join('')}
            </tr>`;
        });

        html += `</table>`;
        return html;
    }

    _buildAnalysisHtml(index, pRow, pCol, leavingVarIdx) {
        let html = `<div class="step-analysis" style="margin-top: 15px; padding: 12px; background: rgba(111, 26, 143, 0.05); border-radius: 8px; border-left: 4px solid #6f1a8f;">`;
        
        if (pRow !== -1 && pCol !== -1) {
            html += `
                <p><strong>Pivot Operation:</strong></p>
                <ul style="list-style: none; padding-left: 5px; margin-top: 5px; font-size: 0.95em;">
                    <li><strong>Entering (x̂):</strong> x<sub>${pCol + 1}</sub> (Reduced cost indicates improvement)</li>
                    <li><strong>Leaving (x̌):</strong> x<sub>${leavingVarIdx + 1}</sub> (Reached zero first in Minimum Ratio Test)</li>
                    <li><strong>Basis (x̄):</strong> Variables that remain in the basic set.</li>
                </ul>`;
        } else {
            html += `<p style="color: #27ae60; font-weight: bold;">${
                index === 0 ? 'Tableau Initialized.' : '✅ Optimal Solution Found.'
            }</p>`;
        }
        
        html += `</div>`;
        return html;
    }

    _setupPathControls(numDecisionVars) {
        this.varSelect1.innerHTML = '';
        this.varSelect2.innerHTML = '';

        for (let i = 0; i < numDecisionVars; i++) {
            this.varSelect1.innerHTML += `<option value="${i}">x${i+1}</option>`;
            this.varSelect2.innerHTML += `<option value="${i}">x${i+1}</option>`;
        }

        this.pathControls.style.display = 'block';
    }
}
