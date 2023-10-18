'use strict';

import { BaseShape } from "./BaseShape.js";

export class TriangularPyramid extends BaseShape {

    constructor(app, color = {red: 1.0, green: 0.0, blue: 0.0, alpha: 1.0}, height = 1.0, depth = 1.0) {
        super(app);
        this.color = color;
        this.height = height;
        this.depth = depth;
        this.setPositions();
        this.setColors();
    }

    setPositions() {
        const halfHeight = this.height / 2;
        const halfDepth = this.depth / 2;

        // Base vertices:
        const base = [
            0.0, -halfHeight, -halfDepth,            // Bottom center
            -halfDepth, -halfHeight, halfDepth,      // Left
            halfDepth, -halfHeight, halfDepth        // Right
        ];

        // Apex of the pyramid:
        const apex = [0.0, halfHeight, 0.0];

        // Triangles:
        const side1 = [
            ...base.slice(0, 3),
            ...base.slice(3, 6),
            ...apex
        ];

        const side2 = [
            ...base.slice(3, 6),
            ...base.slice(6),
            ...apex
        ];

        const side3 = [
            ...base.slice(6),
            ...base.slice(0, 3),
            ...apex
        ];

        this.positions = [
            ...side1,
            ...side2,
            ...side3
        ];
    }

    // Method to update the dimensions of the pyramid.
    updateDimensions(newHeight, newDepth) {
        this.height = newHeight;
        this.depth = newDepth;
        // Update positions based on the new dimensions.
        this.setPositions();
        // Re-initialize the buffers with the updated positions.
        this.initBuffers();
    }

    setColors() {
        this.colors = [];
        for (let i = 0; i < 9; i++) { // 9 vertices for a triangular pyramid.
            this.colors.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
    }

    draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        super.draw(shaderInfo, elapsed, modelMatrix);
        // Drawing the triangular pyramid:
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 9);
    }
}
