'use strict';

import {BaseShape} from "./BaseShape.js";

export class Sphere extends BaseShape {
    constructor(app, color = {red: 1.0, green: 0.0, blue: 0.0, alpha: 1.0}, radius = 1, latitudeBands = 30, longitudeBands = 30) {
        super(app);
        this.color = color;
        this.radius = radius;
        this.latitudeBands = latitudeBands;
        this.longitudeBands = longitudeBands;
    }

    createVertices() {
        super.createVertices();

        for (let latNumber = 0; latNumber <= this.latitudeBands; latNumber++) {
            let theta = latNumber * Math.PI / this.latitudeBands;
            let sinTheta = Math.sin(theta);
            let cosTheta = Math.cos(theta);

            for (let longNumber = 0; longNumber <= this.longitudeBands; longNumber++) {
                let phi = longNumber * 2 * Math.PI / this.longitudeBands;
                let sinPhi = Math.sin(phi);
                let cosPhi = Math.cos(phi);

                let x = cosPhi * sinTheta;
                let y = cosTheta;
                let z = sinPhi * sinTheta;

                this.positions.push(this.radius * x, this.radius * y, this.radius * z);
                this.colors.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
            }
        }
    }

    draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        super.draw(shaderInfo, elapsed, modelMatrix);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    }
}
