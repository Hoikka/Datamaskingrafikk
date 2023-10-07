// scooter.js

'use strict';

import {Stack} from "../../base/helpers/Stack.js";
import {CylinderTexture} from "../../base/shapes/CylinderTexture.js";
import {CubeTextured} from "../../base/shapes/CubeTextured.js";
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

    initLight(textureLightShaderInfo) {
        // Assuming you have a reference to the WebGL rendering context in this.app.gl:
        let gl = this.app.gl;

        // Assuming you have a lightInfo object available in this.light or similar:
        let lightInfo = this.app.light;

        // Activate the shader for the object:
        gl.useProgram(textureLightShaderInfo.program);


        // Set ambient light color:
        gl.uniform3f(
            textureLightShaderInfo.uniformLocations.ambientLightColor,
            lightInfo.ambientLightColor.r, lightInfo.ambientLightColor.g, lightInfo.ambientLightColor.b
        );

        // Set diffuse light color:
        gl.uniform3f(
            textureLightShaderInfo.uniformLocations.diffuseLightColor,
            lightInfo.diffuseLightColor.r, lightInfo.diffuseLightColor.g, lightInfo.diffuseLightColor.b
        );
        // Set light position:
        gl.uniform3f(
            textureLightShaderInfo.uniformLocations.lightPosition,
            lightInfo.lightPosition.x, lightInfo.lightPosition.y, lightInfo.lightPosition.z
        );
    }


    draw(shaderInfo, textureLightShaderInfo, elapsed, modelMatrix) {
        this.drawScooter(shaderInfo, textureLightShaderInfo, elapsed, modelMatrix);
    }

    drawScooter(shaderInfo, textureLightShaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        // Beregner og sender inn matrisa som brukes til å transformere normalvektorene:
        let normalMatrix = mat3.create();
        // Send normalmatrisa til shaderen (merk: 3x3):
	    mat3.normalFromMat4(normalMatrix, modelMatrix.elements);
        this.app.gl.uniformMatrix3fv(textureLightShaderInfo.uniformLocations.normalMatrix, false, normalMatrix);
        modelMatrix.translate(0, 1, 0);  // Starter med å sette x-aksen som nullpunkt
        this.stack.pushMatrix(modelMatrix);
        modelMatrix = this.stack.peekMatrix(modelMatrix);

        this.drawPlatform(shaderInfo, textureLightShaderInfo, elapsed, modelMatrix);
        this.drawHandle(shaderInfo, textureLightShaderInfo, elapsed,modelMatrix);

    }

    drawPlatform(shaderInfo, textureLightShaderInfo, elapsed, modelMatrix){
        this.initLight(textureLightShaderInfo);

        modelMatrix = this.stack.peekMatrix();

        // Main body element
        modelMatrix.scale(5, 0.5, 1);
        this.bodyPart.draw(textureLightShaderInfo, elapsed, modelMatrix);

        // Front body element
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(5, 1, 0);
        modelMatrix.rotate(45, 0, 0, 1);
        modelMatrix.scale(1.5, 0.5, 0.5);
        this.bodyPart.draw(textureLightShaderInfo, elapsed, modelMatrix);

        // Back body element
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-4, 1, 0);
        modelMatrix.rotate(-45, 0, 0, 1);
        modelMatrix.scale(1, 0.25, 0.5);
        this.bodyPart.draw(textureLightShaderInfo, elapsed, modelMatrix);

        // Back spoiler element
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-5, 2, 0);
        modelMatrix.scale(1, 0.25, 0.5);
        this.bodyPart.draw(textureLightShaderInfo, elapsed, modelMatrix);

        // Back wheel
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(-5.5, 0, -0.5);
        modelMatrix.rotate(this.rotationWheel, 0, 0, 1);
        this.stack.pushMatrix(modelMatrix);
        //this.drawWheels(textureLightShaderInfo, elapsed, modelMatrix)
        this.stack.popMatrix();
    }

    drawWheels(shaderInfo, textureLightShaderInfo, elapsed, modelMatrix){
        //this.initLight(textureLightShaderInfo);

        modelMatrix = this.stack.peekMatrix();

        this.wheel.draw(textureLightShaderInfo, elapsed, modelMatrix);
    }
    drawHandle(shaderInfo,textureLightShaderInfo,elapsed,modelMatrix){
        this.initLight(textureLightShaderInfo);

        modelMatrix = this.stack.peekMatrix();

        modelMatrix.translate(6.5, 0, 0); // Move to the handle's position first
        modelMatrix.rotate(15, 0, 0, 1);
        modelMatrix.rotate(this.rotationHandle, 0, 1, 0);
        this.stack.pushMatrix(modelMatrix);

        //long neck
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.scale(0.3, 10, 0.3);
        this.cylinder.draw(textureLightShaderInfo,elapsed,modelMatrix);

        //base neck
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0, -0.2, 0);
        modelMatrix.scale(0.5, 3, 0.5);
        this.cylinder.draw(textureLightShaderInfo,elapsed,modelMatrix);

        //blue handle
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.rotate(90,1,0,0)
        modelMatrix.translate(0,-3,-10);
        modelMatrix.scale(0.3,6,0.3)
        this.cylinder.draw(textureLightShaderInfo,elapsed,modelMatrix);

        //black handle (left)
        modelMatrix.scale(1.1,0.3,1.1);
        this.cylinderBlack.draw(textureLightShaderInfo,elapsed,modelMatrix);

        //black handle (right)
        modelMatrix.translate(0,2.4,0);
        this.cylinderBlack.draw(textureLightShaderInfo,elapsed,modelMatrix);

        // Front wheel
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0.2, 0, -0.5);
        modelMatrix.rotate(this.rotationWheel, 0, 0, 1);
        this.stack.pushMatrix(modelMatrix);
        //this.drawWheels(textureLightShaderInfo, elapsed, modelMatrix)
        this.stack.popMatrix();
    }
}