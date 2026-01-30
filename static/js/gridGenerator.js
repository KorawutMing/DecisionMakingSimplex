/**
 * Grid Generator Module - Handles tableau input grid generation
 */

export class GridGenerator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    /**
     * Generate input grid based on number of variables and constraints
     * @param {number} numVars - Number of variables
     * @param {number} numConstraints - Number of constraints
     * @param {Object} defaultValues - Default values for grid
     */
    generate(numVars, numConstraints, defaultValues = {}) {
        const {
            cValues = [],
            aMatrix = [],
            bValues = []
        } = defaultValues;

        let html = `<table style="width: 100%; border-collapse: collapse;">`;
        
        // Header Row
        html += this._generateHeaderRow(numVars);
        
        // Objective Coefficients Row
        html += this._generateObjectiveRow(numVars, cValues);
        
        // Constraint Rows
        html += this._generateConstraintRows(numVars, numConstraints, aMatrix, bValues);
        
        html += `</table>`;
        this.container.innerHTML = html;
    }

    /**
     * Extract data from the grid
     * @returns {Object} Grid data
     */
    extractData() {
        const cCoeffs = Array.from(document.querySelectorAll('.grid-c'))
            .map(input => input.value.trim());
        
        const bValues = Array.from(document.querySelectorAll('.grid-b'))
            .map(input => parseFloat(input.value) || 0);
        
        const numRows = bValues.length;
        const numCols = cCoeffs.length;
        const A = [];
        
        for (let i = 0; i < numRows; i++) {
            const row = [];
            for (let j = 0; j < numCols; j++) {
                const val = document.querySelector(`.grid-a[data-row="${i}"][data-col="${j}"]`).value;
                row.push(parseFloat(val) || 0);
            }
            A.push(row);
        }

        return { c_T: cCoeffs, A, b_T: bValues };
    }

    _generateHeaderRow(numVars) {
        let html = `<tr class="header-row">
            <td style="width: 100px;">Basis / RHS</td>`;
        
        for (let j = 1; j <= numVars; j++) {
            html += `<td>x<sub>${j}</sub></td>`;
        }
        
        html += `</tr>`;
        return html;
    }

    _generateObjectiveRow(numVars, cValues) {
        let html = `<tr class="obj-row">
            <td style="font-size: 0.8em;">Obj Coeffs (c)</td>`;
        
        for (let j = 0; j < numVars; j++) {
            const defaultVal = cValues[j] || (j >= numVars - 2 ? 'M' : '0');
            html += `<td>
                <input type="text" class="grid-c cell-input" value="${defaultVal}" 
                    style="width: 50px; text-align: center; border:none; background:transparent; font-weight:bold;">
            </td>`;
        }
        
        html += `</tr>`;
        return html;
    }

    _generateConstraintRows(numVars, numConstraints, aMatrix, bValues) {
        let html = '';
        
        for (let i = 0; i < numConstraints; i++) {
            const bVal = bValues[i] || (i === 0 ? 4 : 6);
            
            html += `<tr>
                <td class="rhs-column">
                    <input type="number" class="grid-b cell-input" value="${bVal}" 
                        style="width: 60px; text-align: center; border:none; background:transparent; font-weight:bold;">
                </td>`;
            
            for (let j = 0; j < numVars; j++) {
                const aVal = (aMatrix[i] && aMatrix[i][j]) || 0;
                html += `<td>
                    <input type="number" class="grid-a cell-input" data-row="${i}" data-col="${j}" value="${aVal}" 
                        style="width: 50px; text-align: center; border:none; background:transparent;">
                </td>`;
            }
            
            html += `</tr>`;
        }
        
        return html;
    }
}
