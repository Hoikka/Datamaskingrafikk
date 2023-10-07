'use strict';
import { BaseShape } from './BaseShape.js';
import {ImageLoader} from "../helpers/ImageLoader.js";
import {isPowerOfTwo1} from "../lib/utility-functions.js";

export class Wheel extends BaseShape {
    constructor(app, color = {red:0.8, green:0.0, blue:0.6, alpha:1}, height=2, radius =1.0, sectors=36) {
        super(app);
        this.color = color;
        this.sectors = sectors;
        this.height = height;
        this.radius = radius;
        this.rotation = 0;
        this.createVertices();
        this.setTextureCoordinates();
        this.setColors();
        this.initTextures();
    }

    createVertices() {
        super.createVertices();
        let toPI = 2 * Math.PI;
        let step = toPI / this.sectors;

        // Bottom circle (Rim):
        this.positions.push(0, 0, 0);
        for (let phi = 0.0; phi <= toPI; phi += step) {
            let x = this.radius * Math.cos(phi);
            let z = this.radius * Math.sin(phi);
            this.positions.push(x, 0, z);
        }

        // Top circle (Rim):
        this.positions.push(0, this.height, 0);
        for (let phi = 0.0; phi <= toPI; phi += step) {
            let x = this.radius * Math.cos(phi);
            let z = this.radius * Math.sin(phi);
            this.positions.push(x, this.height, z);
        }

        // Sides of the cylinder (Tire):
        for (let i = 0; i <= this.sectors; i++) {
            let theta = 2 * Math.PI * i / this.sectors;
            let x = this.radius * Math.cos(theta);
            let z = this.radius * Math.sin(theta);

            // Bottom vertex
            this.positions.push(x, 0, z);

            // Top vertex
            this.positions.push(x, this.height, z);
        }
    }

    setTextureCoordinates() {
        this.textureCoordinates = [];
        let toPI = 2 * Math.PI;
        let step = toPI / this.sectors;

        // Bottom circle (Rim):
        this.textureCoordinates.push(0.26367, 0.26367);
        for (let phi = 0.0; phi <= toPI; phi += step) {
            this.textureCoordinates.push(0.26367 + 0.26367 * Math.cos(phi), 0.26367 + 0.26367 * Math.sin(phi));
        }

        // Top circle (Rim):
        this.textureCoordinates.push(0.26367, 0.26367);
        for (let phi = 0.0; phi <= toPI; phi += step) {
            this.textureCoordinates.push(0.26367 + 0.26367 * Math.cos(phi), 0.26367 + 0.26367 * Math.sin(phi));
        }

        // Sides of the cylinder (Tire):
        for (let i = 0; i <= this.sectors; i++) {
            let u = i / this.sectors;

            // Bottom vertex
            this.textureCoordinates.push(u, 0.73633);

            // Top vertex
            this.textureCoordinates.push(u, 1);
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


    initTextures() {
        const textureUrls = ['./../../base/textures/wheelTexture-1.png'];
        if (this.textureCoordinates.length > 0) {
            //Laster textureUrls...
            let imageLoader = new ImageLoader();
            imageLoader.load((textureImages) => {
                    const textureImage = textureImages[0];
                    if (isPowerOfTwo1(textureImage.width) && isPowerOfTwo1(textureImage.height)) {
                        this.wheelTexture = this.gl.createTexture();
                        //Teksturbildet er nå lastet fra server, send til GPU:
                        this.gl.bindTexture(this.gl.TEXTURE_2D, this.wheelTexture);

                        //Unngaa at bildet kommer opp-ned:
                        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
                        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);   //NB! FOR GJENNOMSIKTIG BAKGRUNN!! Sett også this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

                        //Laster teksturbildet til GPU/shader:
                        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureImage);

                        //Teksturparametre:
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);

                        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

                        this.buffers.texture = this.gl.createBuffer();
                        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texture);
                        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureCoordinates), this.gl.STATIC_DRAW);
                    }
                },
                textureUrls);
        }
    }

    handleKeys(elapsed) {
        // Rotate the texture by modifying the texture coordinates
        this.rotation += elapsed * 0.01; // adjust the speed as needed
        this.setTextureCoordinates(); // recompute the texture coordinates based on the new rotation angle
        // You might also want to update the buffer
    }

    draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        super.draw(shaderInfo, elapsed, modelMatrix);

        // Apply transformations
        modelMatrix.rotate(90, 1, 0, 0);
        modelMatrix.scale(1, 0.5, 1);

        // Assuming you have set up texture in your shader and BaseShape
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.wheelTexture);

        // Draw bottom circle:
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.sectors + 2);
        // Draw top circle:
        let offset = (this.sectors + 2);
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, offset, this.sectors + 2);
        // Draw the sides:
        offset += (this.sectors + 2);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, 2 * (this.sectors + 1));
    }
}
