/**
 * Visualization Module - Handles simplex path visualization
 */

export class SimplexVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.simplexPath = [];
    }

    /**
     * Set the simplex path data
     * @param {Array<Array<number>>} path - Array of x-vectors
     */
    setPath(path) {
        this.simplexPath = path;
    }

    /**
     * Draw the simplex path for two selected variables
     * @param {number} varIndex1 - First variable index
     * @param {number} varIndex2 - Second variable index
     */
    draw(varIndex1, varIndex2) {
        if (varIndex1 === varIndex2) {
            alert("Please select two different variables.");
            return;
        }

        this.canvas.style.display = 'block';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Extract projected points (skip initial tableau)
        const points = this.simplexPath.slice(1).map(x => ({
            x: x[varIndex1],
            y: x[varIndex2]
        }));

        // Scaling
        const margin = 50;
        const maxX = Math.max(...points.map(p => p.x)) || 1;
        const maxY = Math.max(...points.map(p => p.y)) || 1;

        const scaleX = (this.canvas.width - 2 * margin) / maxX;
        const scaleY = (this.canvas.height - 2 * margin) / maxY;

        const mapPoint = p => ({
            x: margin + p.x * scaleX,
            y: this.canvas.height - (margin + p.y * scaleY)
        });

        // Draw axes
        this._drawAxes(margin, varIndex1, varIndex2);

        // Draw path
        this._drawPath(points, mapPoint);

        // Draw points and labels
        this._drawPointsAndLabels(points, mapPoint);
    }

    _drawAxes(margin, varIndex1, varIndex2) {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(margin, margin);
        this.ctx.lineTo(margin, this.canvas.height - margin);
        this.ctx.lineTo(this.canvas.width - margin, this.canvas.height - margin);
        this.ctx.stroke();

        // Labels
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(`x${varIndex1 + 1}`, this.canvas.width - margin + 10, this.canvas.height - margin);
        this.ctx.fillText(`x${varIndex2 + 1}`, margin - 20, margin - 10);
    }

    _drawPath(points, mapFunction) {
        this.ctx.strokeStyle = '#6f1a8f';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();

        points.forEach((p, idx) => {
            const mp = mapFunction(p);
            if (idx === 0) {
                this.ctx.moveTo(mp.x, mp.y);
            } else {
                this.ctx.lineTo(mp.x, mp.y);
            }
        });

        this.ctx.stroke();
    }

    _drawPointsAndLabels(points, mapFunction) {
        points.forEach((p, idx) => {
            const mp = mapFunction(p);
            
            // Draw point
            this.ctx.fillStyle = idx === points.length - 1 ? '#27ae60' : '#e74c3c';
            this.ctx.beginPath();
            this.ctx.arc(mp.x, mp.y, 5, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw label
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(idx, mp.x + 6, mp.y - 6);
        });
    }
}
