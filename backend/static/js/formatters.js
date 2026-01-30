/**
 * Formatting Utilities Module
 */

export const formatters = {
    /**
     * Smart format numbers - integers as-is, floats to 4 decimals
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    smartFormat(num) {
        return Number.isInteger(num) ? num.toString() : parseFloat(num.toFixed(4)).toString();
    },

    /**
     * Format reduced cost with M coefficient
     * @param {number} r - Real coefficient
     * @param {number} m - M coefficient
     * @returns {string} Formatted string
     */
    formatReducedCost(r, m) {
        if (Math.abs(m) < 1e-6) {
            return this.smartFormat(r);
        }
        
        let mPart = "";
        if (m === 1) mPart = "M";
        else if (m === -1) mPart = "-M";
        else mPart = this.smartFormat(m) + "M";

        let rPart = "";
        if (Math.abs(r) > 1e-6) {
            rPart = (r > 0 ? " + " : " - ") + this.smartFormat(Math.abs(r));
        }
        
        return mPart + rPart;
    }
};
