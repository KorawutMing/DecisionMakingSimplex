/**
 * API Module - Handles all backend communication
 */

const API_BASE_URL = (typeof window !== 'undefined' && window.location.origin.startsWith('http')) 
    ? window.location.origin 
    : 'http://127.0.0.1:5000';

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

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.error) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    }
};
