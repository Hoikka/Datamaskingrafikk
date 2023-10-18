'use strict';

import { BaseShape } from "./BaseShape.js";

export class Prism extends BaseShape {

    constructor(app, color = {red: 1.0, green: 0.0, blue: 0.0, alpha: 1.0}, depth = 1.0) {
        super(app);
        this.color = color;
        this.depth = depth; // Added depth for 3D
        this.setPositions();
        this.setColors();
    }

    setPositions() {
        // Default positions for the triangular prism:
        const top = [
            0.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0
        ];

        const bottom = [
            0.0, 1.0, -this.depth,
            -1.0, -1.0, -this.depth,
            1.0, -1.0, -this.depth
        ];

        // Now, define the sides of the prism:
        const side1 = [
            ...top.slice(0, 3),
            ...top.slice(3, 6),
            ...bottom.slice(3, 6),

            ...bottom.slice(3, 6),
            ...bottom.slice(0, 3),
            ...top.slice(0, 3)
        ];

        const side2 = [
            ...top.slice(3, 6),
            ...top.slice(6),
            ...bottom.slice(6),

            ...bottom.slice(6),
            ...bottom.slice(3, 6),
            ...top.slice(3, 6)
        ];

        const side3 = [
            ...top.slice(6),
            ...top.slice(0, 3),
            ...bottom.slice(0, 3),

            ...bottom.slice(0, 3),
            ...bottom.slice(6),
            ...top.slice(6)
        ];

        this.positions = [
            ...top,
            ...bottom,
            ...side1,
            ...side2,
            ...side3
        ];
    }

    // Method to update the depth of the prism.
    updateDepth(newDepth) {
        this.depth = newDepth;
        // Update positions based on the new depth.
        this.setPositions();
        // Re-initialize the buffers with the updated positions.
        this.initBuffers();
    }

    setColors() {
        this.colors = [];
        for (let i = 0; i < 12; i++) { // 12 vertices for a triangular prism.
            this.colors.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
    }

    draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        super.draw(shaderInfo, elapsed, modelMatrix);
        // Drawing the triangular prism:
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 12);
    }
}
