'use strict';
import {BaseShape} from './BaseShape.js';

// let myCylinder = new Cylinder(app, undefined, 36, 2, 1.5);  // A cylinder with height 2, radius 1.5

export class Cylinder extends BaseShape {
    constructor(app, color = {red:0.8, green:0.0, blue:0.6, alpha:1}, height=2, radius =1, sectors=36, ) {
        super(app);
        this.color = color;
        this.sectors = sectors;
        this.height = height;
        this.radius = radius;
        this.positions = app.positions;
        this.normals = [];
        this.initNormals();
    }

    createVertices() {
        super.createVertices();

        let toPI = 2*Math.PI;
        let stepGrader = 360 / this.sectors;
        let step = (Math.PI / 180) * stepGrader;
        let r=1, g=0, b=0, a=1;

        // Bottom circle:
        let x=0, y=0, z=0;
        this.positions.push(x,y,z);
        this.colors.push(r,g,b,a);
        this.normals.push(0, -1, 0);
        for (let phi = 0.0; phi <= toPI; phi += step)
        {
            x = this.radius * Math.cos(phi);
            z = this.radius * Math.sin(phi);

            this.positions.push(x,y,z);
            this.colors.push(r,g,b,a);
        }

        // Top circle:
        y = this.height;
        this.positions.push(0,y,0);
        this.colors.push(r,g,b,a);
        this.positions.push(0, this.height, 0);
        for (let phi = 0.0; phi <= toPI; phi += step)
        {
            x = this.radius * Math.cos(phi);
            z = this.radius * Math.sin(phi);

            this.positions.push(x,y,z);
            this.colors.push(r,g,b,a);
        }

        // Sides of the cylinder:
        for (let i = 0; i <= this.sectors; i++) {   // Notice the change from < to <=
            let theta = 2 * Math.PI * i / this.sectors;
            let x = this.radius * Math.cos(theta);
            let z = this.radius * Math.sin(theta);
            let nx = Math.cos(theta);
            let nz = Math.sin(theta);

            // Bottom vertex
            this.positions.push(x, 0, z);
            this.colors.push(r, g, b, a);
            this.normals.push(nx, 0, nz);

            // Top vertex
            this.positions.push(x, this.height, z);
            this.colors.push(r, g, b, a);
            this.normals.push(nx, 0, nz);
        }

    }

    setColors() {
        // Clear the existing colors:
        this.colors = [];

        // Total vertices = 2 circles + sides
        let totalVertices = 2 * (this.sectors + 2) + 2 * (this.sectors + 1);

        // Set the color for each vertex:
        for (let i = 0; i < totalVertices; i++) {
            this.colors.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
    }

    initNormals() {
        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normals), this.gl.STATIC_DRAW);
    }

    connectNormalAttribute(gl, shader, normalBuffer) {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(
            shader.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(shader.attribLocations.vertexNormal);
    };


    draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        super.draw(shaderInfo, elapsed, modelMatrix);
        // Bind the normal buffer.
        //this.connectNormalAttribute(this.gl, shaderInfo, this.normalBuffer);
        // Draw bottom circle:
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.sectors + 2);
        // Draw top circle:
        let offset = (this.sectors + 2); // Not multiplied by 3 as it's already in terms of vertices
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, offset, this.sectors + 2);
        // Draw the sides:
        offset += (this.sectors + 2);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, 2 * (this.sectors + 1)); // 2 vertices for each sector
    }
}
