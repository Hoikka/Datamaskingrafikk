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

        this.bodyPart = new CubeTextured(app, {red:0.8, green:0.0, blue:0.6, alpha:1}, false);
        this.bodyPart.initBuffers();

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
        modelMatrix.translate(0, 1, 0);  // Starter med å sette x-aksen som nullpunkt
        this.stack.pushMatrix(modelMatrix);
        modelMatrix = this.stack.peekMatrix(modelMatrix);


        this.drawPlatform(shaderInfo, textureShaderInfo, elapsed, modelMatrix)

    }

    drawPlatform(shaderInfo, textureShaderInfo, elapsed, modelMatrix){
        modelMatrix = this.stack.peekMatrix();

        // Main body element
        modelMatrix.scale(5, 0.5, 1);
        this.bodyPart.draw(textureShaderInfo, elapsed, modelMatrix);

        // Front body element
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(5, 1, 0);
        modelMatrix.rotate(45, 0, 0);
        modelMatrix.scale(1, 0.5, 0.5);
        this.bodyPart.draw(textureShaderInfo, elapsed, modelMatrix);

        // Back body element
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-4, 1, 0);
        modelMatrix.rotate(-45, 0, 0);
        modelMatrix.scale(1, 0.25, 0.5);
        this.bodyPart.draw(textureShaderInfo, elapsed, modelMatrix);

        // Back spoiler element
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-5, 2, 0);
        modelMatrix.scale(1, 0.25, 0.5);
        this.bodyPart.draw(textureShaderInfo, elapsed, modelMatrix);
    }
}