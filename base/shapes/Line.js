'use strict';

import {BaseShape} from "./BaseShape.js";

export class Line extends BaseShape {

    constructor(app, color = {red: 0.0, green: 1.0, blue: 0.0, alpha: 1.0}, startPoint, endPoint) {
        super(app);
        this.color = color;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.initBuffers();
    }

    setPositions() {
        // Define the line's start and end vertices here.
        this.positions = [
            this.startPoint[0], this.startPoint[1], this.startPoint[2],
            this.endPoint[0], this.endPoint[1], this.endPoint[2]
        ];
    }

    setColors() {
        for (let i = 0; i < 2; i++) {
            this.colors.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
    }

    draw(shaderInfo, elapsed, modelMatrix) {
        super.draw(shaderInfo, elapsed, modelMatrix);
        // Drawing the line segment:
        this.gl.drawArrays(this.gl.LINES, 0, 2);
    }
}