/**
 * API Module - Handles all backend communication
 */

const API_BASE_URL = 'http://127.0.0.1:5000';

export const api = {
    /**
     * Solve a linear programming problem
     * @param {Object} payload - Problem configuration
     * @returns {Promise<Object>} Solution data
     */
    async solve(payload) {
        const response = await fetch(`${API_BASE_URL}/solve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    }
};
