/**
 * Grid Generator Module - Handles tableau input grid generation
 */

function parseNumOrFraction(val) {
    if (val === null || val === undefined) return 0;
    const s = String(val).trim();
    if (!s) return 0;
    if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
                return num / den;
            }
        }
    }
    return parseFloat(s) || 0;
}

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

        this._setupCellInteractions();
    }

    /**
     * Clear all cell inputs to zeros
     */
    clear() {
        document.querySelectorAll('.grid-a').forEach(input => input.value = '0');
        document.querySelectorAll('.grid-b').forEach(input => input.value = '0');
        document.querySelectorAll('.grid-c').forEach(input => input.value = '0');
    }

    /**
     * Extract data from the grid
     * @returns {Object} Grid data
     */
    extractData() {
        const cCoeffs = Array.from(document.querySelectorAll('.grid-c'))
            .map(input => input.value.trim());
        
        const bValues = Array.from(document.querySelectorAll('.grid-b'))
            .map(input => parseNumOrFraction(input.value));
        
        const numRows = bValues.length;
        const numCols = cCoeffs.length;
        const A = [];
        
        for (let i = 0; i < numRows; i++) {
            const row = [];
            for (let j = 0; j < numCols; j++) {
                const cell = document.querySelector(`.grid-a[data-row="${i}"][data-col="${j}"]`);
                row.push(cell ? parseNumOrFraction(cell.value) : 0);
            }
            A.push(row);
        }

        return { c_T: cCoeffs, A, b_T: bValues };
    }

    _setupCellInteractions() {
        const table = this.container.querySelector('table');
        if (!table) return;

        // Auto-select text on focus so user can type immediately
        table.addEventListener('focusin', (e) => {
            if (e.target.classList && e.target.classList.contains('cell-input')) {
                e.target.select();
            }
        });

        // Arrow keys and Enter navigation
        table.addEventListener('keydown', (e) => {
            const target = e.target;
            if (!target.classList || !target.classList.contains('cell-input')) return;

            const r = parseInt(target.getAttribute('data-row'));
            const c = parseInt(target.getAttribute('data-col'));

            let nextCell = null;
            if (e.key === 'ArrowRight') {
                nextCell = table.querySelector(`.cell-input[data-row="${r}"][data-col="${c + 1}"]`);
                if (!nextCell && c === -1) {
                    nextCell = table.querySelector(`.cell-input[data-row="${r}"][data-col="0"]`);
                }
            } else if (e.key === 'ArrowLeft') {
                if (c === 0 && r >= 0) {
                    nextCell = table.querySelector(`.cell-input[data-row="${r}"][data-col="-1"]`);
                } else {
                    nextCell = table.querySelector(`.cell-input[data-row="${r}"][data-col="${c - 1}"]`);
                }
            } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
                nextCell = table.querySelector(`.cell-input[data-row="${r + 1}"][data-col="${c}"]`);
                if (!nextCell && r === -1) {
                    nextCell = table.querySelector(`.cell-input[data-row="0"][data-col="${c}"]`);
                }
            } else if (e.key === 'ArrowUp') {
                if (r === 0) {
                    nextCell = table.querySelector(`.cell-input[data-row="-1"][data-col="${c}"]`);
                } else {
                    nextCell = table.querySelector(`.cell-input[data-row="${r - 1}"][data-col="${c}"]`);
                }
            }

            if (nextCell) {
                e.preventDefault();
                nextCell.focus();
                nextCell.select();
            }
        });
    }

    _generateHeaderRow(numVars) {
        let html = `<tr class="header-row">
            <td style="width: 90px;">Basis / RHS</td>`;
        
        for (let j = 1; j <= numVars; j++) {
            html += `<td>x<sub>${j}</sub></td>`;
        }
        
        html += `</tr>`;
        return html;
    }

    _generateObjectiveRow(numVars, cValues) {
        let html = `<tr class="obj-row">
            <td style="font-size: 0.85em; font-weight: bold;">Obj Coeffs (c)</td>`;
        
        for (let j = 0; j < numVars; j++) {
            const defaultVal = cValues[j] !== undefined ? cValues[j] : (j >= numVars - 2 ? 'M' : '0');
            html += `<td>
                <input type="text" class="grid-c cell-input" data-row="-1" data-col="${j}" value="${defaultVal}">
            </td>`;
        }
        
        html += `</tr>`;
        return html;
    }

    _generateConstraintRows(numVars, numConstraints, aMatrix, bValues) {
        let html = '';
        
        for (let i = 0; i < numConstraints; i++) {
            const bVal = bValues[i] !== undefined ? bValues[i] : (i === 0 ? 4 : 6);
            
            html += `<tr>
                <td class="rhs-column">
                    <input type="text" inputmode="decimal" class="grid-b cell-input" data-row="${i}" data-col="-1" value="${bVal}">
                </td>`;
            
            for (let j = 0; j < numVars; j++) {
                const aVal = (aMatrix[i] && aMatrix[i][j] !== undefined) ? aMatrix[i][j] : 0;
                html += `<td>
                    <input type="text" inputmode="decimal" class="grid-a cell-input" data-row="${i}" data-col="${j}" value="${aVal}">
                </td>`;
            }
            
            html += `</tr>`;
        }
        
        return html;
    }
}
