// scooter.js

'use strict';

import {Stack} from "../../base/helpers/Stack.js";
import {CylinderTexture} from "../../base/shapes/CylinderTexture.js";
import {CubeTextured} from "../../base/shapes/CubeTextured.js";
import {Cube} from "../../base/shapes/Cube.js";
import {Cylinder} from "../../base/shapes/Cylinder.js";
import {Wheel} from "../../base/shapes/Wheel.js";

export class Scooter {
    constructor(app) {
        this.app = app;

        this.stack = new Stack();

        //init of different parts
        this.bodyPart = new CubeTextured(app, {red:0.8, green:0.0, blue:0.6, alpha:1}, false);
        this.bodyPart.initBuffers();

        this.wheel = new Wheel(app);
        this.wheel.initBuffers();

        this.cylinder = new CylinderTexture(app,{red:0, green:0.0, blue:1, alpha:1},1,1,20);
        this.cylinder.initBuffers();

        this.cylinderBlack = new Cylinder(app,{red:0, green:0, blue:0, alpha:1},1,1,20);
        this.cylinderBlack.initBuffers();

        this.rotationHandle = 0;
        this.rotationWheel = 0;
    }

    handleKeys(elapsed) {
        if (this.app.currentlyPressedKeys['KeyN'] && this.rotationHandle < 45) {
            this.rotationHandle += 1.0;
        }
        if (this.app.currentlyPressedKeys['KeyM'] && this.rotationHandle > -45) {
            this.rotationHandle -= 1.0;
        }
        if (this.app.currentlyPressedKeys['KeyF']) {
            this.rotationWheel += 1.0;
        }
        if (this.app.currentlyPressedKeys['KeyG']) {
            this.rotationWheel -= 1.0;
        }
    }

    draw(shaderInfo, textureShaderInfo, elapsed, modelMatrix) {
        this.drawScooter(shaderInfo, textureShaderInfo, elapsed, modelMatrix);
    }

    drawScooter(shaderInfo, textureShaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        modelMatrix.translate(0, 1, 0);  // Starter med å sette x-aksen som nullpunkt
        this.stack.pushMatrix(modelMatrix);
        modelMatrix = this.stack.peekMatrix(modelMatrix);


        this.drawPlatform(shaderInfo, textureShaderInfo, elapsed, modelMatrix);
        this.drawHandle(shaderInfo,textureShaderInfo,elapsed,modelMatrix);

    }

    drawPlatform(shaderInfo, textureShaderInfo, elapsed, modelMatrix){
        modelMatrix = this.stack.peekMatrix();

        // Main body element
        modelMatrix.scale(5, 0.5, 1);
        this.bodyPart.draw(textureShaderInfo, elapsed, modelMatrix);

        // Front body element
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(5, 1, 0);
        modelMatrix.rotate(45, 0, 0, 1);
        modelMatrix.scale(1.5, 0.5, 0.5);
        this.bodyPart.draw(textureShaderInfo, elapsed, modelMatrix);

        // Back body element
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-4, 1, 0);
        modelMatrix.rotate(-45, 0, 0, 1);
        modelMatrix.scale(1, 0.25, 0.5);
        this.bodyPart.draw(textureShaderInfo, elapsed, modelMatrix);

        // Back spoiler element
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-5, 2, 0);
        modelMatrix.scale(1, 0.25, 0.5);
        this.bodyPart.draw(textureShaderInfo, elapsed, modelMatrix);

        // Back wheel
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-5.5, 0, -0.5);
        modelMatrix.rotate(this.rotationWheel, 0, 0, 1);
        this.stack.pushMatrix(modelMatrix);
        this.drawWheels(shaderInfo, textureShaderInfo, elapsed, modelMatrix)
        this.stack.popMatrix();
    }

    drawWheels(shaderInfo, textureShaderInfo, elapsed, modelMatrix){
        modelMatrix = this.stack.peekMatrix();

        this.wheel.draw(textureShaderInfo, elapsed, modelMatrix);
    }
    drawHandle(shaderInfo,textureShaderInfo,elapsed,modelMatrix){
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(6.5, 0, 0); // Move to the handle's position first
        modelMatrix.rotate(15, 0, 0, 1);
        modelMatrix.rotate(this.rotationHandle, 0, 1, 0);
        this.stack.pushMatrix(modelMatrix);

        //long neck
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.scale(0.3, 10, 0.3);
        this.cylinder.draw(textureShaderInfo,elapsed,modelMatrix);

        //base neck
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -0.2, 0);
        modelMatrix.scale(0.5, 3, 0.5);
        this.cylinder.draw(textureShaderInfo,elapsed,modelMatrix);

        //blue handle
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.rotate(90,1,0,0)
        modelMatrix.translate(0,-3,-10);
        modelMatrix.scale(0.3,6,0.3)
        this.cylinder.draw(textureShaderInfo,elapsed,modelMatrix);

        //black handle (left)
        modelMatrix.scale(1.1,0.3,1.1);
        this.cylinderBlack.draw(shaderInfo,elapsed,modelMatrix);

        //black handle (right)
        modelMatrix.translate(0,2.4,0);
        this.cylinderBlack.draw(shaderInfo,elapsed,modelMatrix);

        // Front wheel
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0.2, 0, -0.5);
        modelMatrix.rotate(this.rotationWheel, 0, 0, 1);
        this.stack.pushMatrix(modelMatrix);
        this.drawWheels(shaderInfo, textureShaderInfo, elapsed, modelMatrix)
        this.stack.popMatrix();
    }
}