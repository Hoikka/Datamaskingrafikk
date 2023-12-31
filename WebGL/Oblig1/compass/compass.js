// compass.js

'use strict';

import {Stack} from "../../base/helpers/Stack.js";
import {Sphere} from "../../base/shapes/Sphere.js";
import {Cylinder} from "../../base/shapes/Cylinder.js";
import {Triangle} from "../../base/shapes/Triangle.js";
import {Rectangle} from "../../base/shapes/Rectangle.js";
import {TriangularPyramid} from "../../base/shapes/TriangularPyramid.js";

export class Compass{
    constructor(app) {
        this.app = app;

        this.stack = new Stack();

        this.northPoint = new Sphere(app);
        this.northPoint.initBuffers();

        this.centerCylinder = new Cylinder(app, {red:0.0, green:0.0, blue:0.0, alpha:1}, 2.01, 1);
        this.centerCylinder.initBuffers();
        this.housingCylinder = new Cylinder(app, {red:0.7, green:0.7, blue:0.7, alpha:0.5}, 2, 10);
        this.housingCylinder.initBuffers();

        this.redNeedle = new TriangularPyramid(app,{red: 1.0, green: 0.0, blue: 0.0, alpha: 1.0}, 6, 1);
        this.redNeedle.initBuffers();

        this.blueNeedle = new TriangularPyramid(app, {red: 0.0, green: 0.0, blue: 1.0, alpha: 1.0}, 6, 1);
        this.blueNeedle.initBuffers();

        let helperNeedlePosition = [
            5.00, 0.0, 0.0,
            0.0, 0.0, 0.5,
            0.0, 0.0, -0.5
        ]
        this.helperArrow = new Triangle(app, {red: 0.9, green: 0.9, blue: 0.9, alpha: 1.0})
        this.helperArrow.updatePositions(helperNeedlePosition);
        this.helperArrow.initBuffers();

        this.redRimMarking = new Rectangle(app, {red: 1.0, green: 0.0, blue: 0.0, alpha: 1.0}, 2, 0.5);
        this.redRimMarking.initBuffers();

        this.blueRimMarking = new Rectangle(app, {red: 0.0, green: 0.0, blue: 1.0, alpha: 1.0}, 2, 0.5);
        this.blueRimMarking.initBuffers();

        this.blackRimMarkings = new Rectangle(app, {red: 0.0, green: 0.0, blue: 0.0, alpha: 1.0}, 2, 0.5);
        this.blackRimMarkings.initBuffers();

        this.rotationX = 0;
    }

    handleKeys() {
        if (this.app.currentlyPressedKeys['KeyN']) {
            this.rotationX += 1.0;
        }
        if (this.app.currentlyPressedKeys['KeyM']) {
            this.rotationX -= 1.0;
        }
    }

    draw(shaderInfo, elapsed, modelMatrix){
        this.drawCompass(shaderInfo, elapsed, modelMatrix);
        this.setNorth(shaderInfo, elapsed, modelMatrix);
    }

    drawCompass(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        this.stack.pushMatrix(modelMatrix);
        modelMatrix = this.stack.peekMatrix(modelMatrix);

        modelMatrix.translate(0, 0.1, 0);  // Makes the center cylinder "pop" out of the housing a tiny bit
        this.centerCylinder.draw(shaderInfo, elapsed, modelMatrix);

        modelMatrix.translate(0, 2, 0);  // Position the elements on top of the housing
        this.stack.pushMatrix(modelMatrix);

        this.drawNeedles(shaderInfo, elapsed, modelMatrix);

        this.housingCylinder.draw(shaderInfo, modelMatrix);

        this.drawHousingElements(shaderInfo, elapsed, modelMatrix);
    }

    drawNeedles(shaderInfo, elapsed, modelMatrix) {
        modelMatrix = this.stack.peekMatrix(modelMatrix);

        // Position red needle
        modelMatrix.translate(3, 0, -0.15);  // Place needle base in the middle of the compass
        modelMatrix.rotate(-90, 0, 0, 1);  // Rotates the needles to lay parallel with the compass
        modelMatrix.rotate(-33, 0, 1, 0);  // Rotate the triangle so flat side is parallel with compass
        this.redNeedle.draw(shaderInfo, elapsed, modelMatrix);

        // Position the blue needle:
        modelMatrix.translate(0, -6, 0);
        modelMatrix.rotate(180, 0, 0, 1);  // Rotate the triangle to point in the opposite direction
        this.blueNeedle.draw(shaderInfo, elapsed, modelMatrix);
    }

    drawHousingElements(shaderInfo, elapsed, modelMatrix) {
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.translate(0.0, -0.05, 0.0);  // Put helper needle a little under compass needle

        // Helper Arrow 1
        modelMatrix.rotate(this.rotationX, 0, 1, 0);  // Add rotation to first arrow
        this.helperArrow.draw(shaderInfo, elapsed, modelMatrix);

        // Helper Arrow 2
        modelMatrix.rotate(90, 0, 1, 0);  // Rotate consecutive arrows by 90 degree
        this.helperArrow.draw(shaderInfo, elapsed, modelMatrix);

        // Helper Arrow 3
        modelMatrix.rotate(90, 0, 1, 0);
        this.helperArrow.draw(shaderInfo, elapsed, modelMatrix);

        // Helper Arrow 4
        modelMatrix.rotate(90, 0, 1, 0);
        this.helperArrow.draw(shaderInfo, elapsed, modelMatrix);

        // Fix the rotation for rim markings
        modelMatrix.rotate(90, 0, 1, 0);
        modelMatrix.rotate(90, 1, 0, 0);
        this.stack.pushMatrix(modelMatrix);

        // Red housing mark
        modelMatrix.translate(9, 0, 0);
        this.redRimMarking.draw(shaderInfo, elapsed, modelMatrix);

        // Blue housing mark
        modelMatrix.translate(-18, 0, 0)
        this.blueRimMarking.draw(shaderInfo, elapsed, modelMatrix);

        // Large black rim markings
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.rotate(90, 0, 0, 1)
        modelMatrix.translate(9, 0, 0);
        this.blackRimMarkings.draw(shaderInfo, elapsed, modelMatrix);

        modelMatrix.translate(-18, 0, 0);
        this.blackRimMarkings.draw(shaderInfo, elapsed, modelMatrix);

        // Small black rim markings
        modelMatrix = this.stack.peekMatrix();
        modelMatrix.rotate(45, 0, 0, 1);
        modelMatrix.translate(9, 0, 0);
        modelMatrix.scale(0.6, 0.6, 0)
        this.blackRimMarkings.draw(shaderInfo, elapsed, modelMatrix);

        modelMatrix = this.stack.peekMatrix();
        modelMatrix.rotate(45, 0, 0, 1);
        modelMatrix.translate(-9, 0, 0);
        modelMatrix.scale(0.6, 0.6, 0)
        this.blackRimMarkings.draw(shaderInfo, elapsed, modelMatrix);

        modelMatrix = this.stack.peekMatrix();
        modelMatrix.rotate(-45, 0, 0, 1);
        modelMatrix.translate(9, 0, 0);
        modelMatrix.scale(0.6, 0.6, 0);
        this.blackRimMarkings.draw(shaderInfo, elapsed, modelMatrix);

        modelMatrix = this.stack.peekMatrix();
        modelMatrix.rotate(-45, 0, 0, 1);
        modelMatrix.translate(-9, 0, 0);
        modelMatrix.scale(0.6, 0.6, 0)
        this.blackRimMarkings.draw(shaderInfo, elapsed, modelMatrix);
    }

    setNorth(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()){
        this.stack.pushMatrix(modelMatrix);
        modelMatrix = this.stack.peekMatrix(modelMatrix);

        modelMatrix.translate(25, 0, 0);

        this.northPoint.draw(shaderInfo, elapsed, modelMatrix);
        this.stack.empty();
    }
}
