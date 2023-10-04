'use strict';

import {BaseShape} from "./BaseShape.js";

export class Triangle extends BaseShape {

    constructor(app, color = {red: 1.0, green: 0.0, blue: 0.0, alpha: 1.0}, positions = null) {
        super(app);
        this.color = color;
        // If positions are provided in the constructor, use them. Otherwise, default to null.
        this.customPositions = positions;
    }

    setPositions() {
        // If customPositions are set, use them. Otherwise, default to the original positions.
        if (this.customPositions) {
            this.positions = this.customPositions;
        } else {
            // Default positions for the triangle.
            this.positions = [
                0.0, 1.0, 0.0,
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0
            ];
        }
    }

    // Method to update the positions at any time.
    updatePositions(newPositions) {
        this.customPositions = newPositions;
        // You might also need to re-initialize the buffers if positions change after the initial setup.
        this.initBuffers();
    }

    setColors() {
        for (let i = 0; i < 3; i++) {
            this.colors.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
    }

    draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        super.draw(shaderInfo, elapsed, modelMatrix);
        // Drawing the triangle:
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }
}
