// scooter.js

'use strict';

import {Stack} from "../../base/helpers/Stack.js";
import {CylinderTexture} from "../../base/shapes/CylinderTexture.js";
import {CubeTextured} from "../../base/shapes/CubeTextured.js";
import {Cube} from "../../base/shapes/Cube.js";

export class Scooter {
    constructor(app) {
        this.app = app;

        this.stack = new Stack();

        this.scooterBody = new CubeTextured(app, {red:0.8, green:0.0, blue:0.6, alpha:1}, false);
        this.scooterBody.initBuffers();

        this.rotationX = 0;
        this.translationX = 0;
    }

    handleKeys(elapsed) {
        if (this.app.currentlyPressedKeys['KeyN']) {
            this.rotationX += 1.0;
        }
        if (this.app.currentlyPressedKeys['KeyM']) {
            this.rotationX -= 1.0;
        }
        if (this.app.currentlyPressedKeys['KeyF']) {
            this.rotationX += 1.0;
        }
        if (this.app.currentlyPressedKeys['KeyG']) {
            this.rotationX -= 1.0;
        }
    }

    draw(shaderInfo, textureShaderInfo, elapsed, modelMatrix) {
        this.drawScooter(shaderInfo, textureShaderInfo, elapsed, modelMatrix);
    }

    drawScooter(shaderInfo, textureShaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        this.stack.pushMatrix(modelMatrix);
        modelMatrix = this.stack.peekMatrix(modelMatrix);

        this.scooterBody.draw(textureShaderInfo, elapsed, modelMatrix);
    }
}