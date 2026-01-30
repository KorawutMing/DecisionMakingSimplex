/**
 * Parser Module - Handles parsing of different input formats
 */

export const parsers = {
    /**
     * Parse standardized string format
     * @param {string} problemString - Multi-line problem specification
     * @returns {Object} Parsed problem data
     */
    parseStandardizedString(problemString) {
        const lines = problemString.split('\n')
            .map(line => line.trim())
            .filter(line => line);
        
        let c_T = null;
        let A = null;
        let b_T = null;
        let obj = 'min';
        let rule = 'bland';
        
        lines.forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) return;
            
            const key = line.substring(0, colonIndex).trim().toLowerCase();
            const value = line.substring(colonIndex + 1).trim();
            
            switch (key) {
                case 'c':
                    c_T = value.split(',').map(s => s.trim());
                    break;
                case 'a':
                    A = value.split(';').map(row => 
                        row.split(',').map(s => parseFloat(s.trim()))
                    );
                    break;
                case 'b':
                    b_T = value.split(',').map(s => parseFloat(s.trim()));
                    break;
                case 'obj':
                    obj = value.toLowerCase();
                    break;
                case 'rule':
                    rule = value.toLowerCase().replace('_', '');
                    break;
            }
        });
        
        if (!c_T || !A || !b_T) {
            throw new Error('Missing required fields (c, A, or b)');
        }
        
        return {
            c_T,
            A,
            b_T,
            is_minimize: obj === 'min',
            pivot_rule: rule === 'maxcoeff' ? 'max' : 'bland'
        };
    },

    /**
     * Parse COPT LP format
     * @param {string} coptString - COPT format LP problem
     * @returns {Object} Parsed problem data
     */
    parseCOPTString(coptString) {
        const lines = coptString.split('\n')
            .map(l => l.trim())
            .filter(l => l);
        
        let isMinimize = true;
        let section = '';
        let constraints = [];
        let objectiveRaw = "";

        // Find max variable index
        const varMatches = coptString.match(/x(\d+)/g) || [];
        const numVars = Math.max(...varMatches.map(m => parseInt(m.substring(1))), 0);

        if (numVars === 0) {
            throw new Error("No variables (x1, x2...) found.");
        }

        const c_T = Array(numVars).fill("0");
        const b_T = [];
        const A = [];

        // Parse sections
        for (let line of lines) {
            let l = line.toLowerCase();
            
            if (l.startsWith('min')) {
                isMinimize = true;
                section = 'obj';
                continue;
            }
            if (l.startsWith('max')) {
                isMinimize = false;
                section = 'obj';
                continue;
            }
            if (l.startsWith('sub')) {
                section = 'cons';
                continue;
            }
            if (l.startsWith('bound') || l.startsWith('end')) {
                section = '';
                continue;
            }

            if (section === 'obj') {
                objectiveRaw += line.split(':')[1] || line;
            } else if (section === 'cons') {
                constraints.push(line);
            }
        }

        // Parse objective
        const termRegex = /([+-]?\s*[\d.M]*)\s*x(\d+)/g;
        let match;
        
        while ((match = termRegex.exec(objectiveRaw)) !== null) {
            let coeff = match[1].replace(/\s+/g, '') || "+1";
            if (coeff === "+") coeff = "1";
            if (coeff === "-") coeff = "-1";
            const idx = parseInt(match[2]) - 1;
            c_T[idx] = coeff;
        }

        // Parse constraints
        for (let rowStr of constraints) {
            if (!rowStr.includes('=')) continue;
            
            const [lhs, rhs] = rowStr.split(':')[1].split('=');
            b_T.push(parseFloat(rhs.trim()));

            const row = Array(numVars).fill(0);
            termRegex.lastIndex = 0; // Reset regex
            
            while ((match = termRegex.exec(lhs)) !== null) {
                let coeffStr = match[1].replace(/\s+/g, '') || "+1";
                let val = 0;
                
                if (coeffStr === "+") val = 1;
                else if (coeffStr === "-") val = -1;
                else val = parseFloat(coeffStr);
                
                const idx = parseInt(match[2]) - 1;
                row[idx] = val;
            }
            
            termRegex.lastIndex = 0;
            A.push(row);
        }

        return {
            c_T,
            A,
            b_T,
            is_minimize: isMinimize,
            pivot_rule: 'bland'
        };
    }
};
