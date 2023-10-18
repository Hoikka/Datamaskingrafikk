'use strict';

import {BaseShape} from "./BaseShape.js";

export class Rectangle extends BaseShape {

    constructor(app, color = {red: 1.0, green: 0.0, blue: 0.0, alpha: 1.0}, width = 1, height = 1) {
        super(app);
        this.color = color;
        this.width = width;
        this.height = height;
        this.setPositions();
        this.setColors();
    }

    setPositions() {
        // Define rectangle vertices using the width and height:
        this.positions = [
            -this.width / 2,  this.height / 2, 0.0,  // Top-left
            this.width / 2,  this.height / 2, 0.0,  // Top-right
            -this.width / 2, -this.height / 2, 0.0,  // Bottom-left
            this.width / 2, -this.height / 2, 0.0,  // Bottom-right
        ];
        this.vertexCount = this.positions/3;
    }

    // Method to update the size of the rectangle at any time.
    updateSize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;
        // Update positions based on new width and height.
        this.setPositions();
        // Re-initialize the buffers with the updated positions.
        this.initBuffers();
    }

    setColors() {
        this.colors = [];
        for (let i = 0; i < 4; i++) {  // 4 vertices for a rectangle.
            this.colors.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
    }

    draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        super.draw(shaderInfo, elapsed, modelMatrix);
        // Drawing the rectangle using two triangles:
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexCount);
    }
}
