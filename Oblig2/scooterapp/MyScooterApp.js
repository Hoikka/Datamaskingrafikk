//MyScooterApp.js

import {BaseApp} from '../../base/BaseApp.js';
import {Scooter} from '../scooter/scooter.js';
import {WebGLShader} from "../../base/helpers/WebGLShader.js";
import {vectorToString} from "../../base/lib/utility-functions.js";
export class MyScooterApp extends BaseApp {
    constructor() {
        super(true);

        this.scooter = new Scooter(this);
    }

    initShaders() {
        super.initShaders();    //NB!

        let vertexShaderSource = document.getElementById('combined-vertex-shader').innerHTML;
        let combinedFragmentShaderSource = document.getElementById('combined-fragment-shader').innerHTML;

        const glslTextureLightShader = new WebGLShader(this.gl, vertexShaderSource, combinedFragmentShaderSource);

        this.textureLightShaderInfo = {
            program: glslTextureLightShader.shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(glslTextureLightShader.shaderProgram, 'aVertexPosition'),
                vertexColor: this.gl.getAttribLocation(glslTextureLightShader.shaderProgram, 'aVertexColor'),
                vertexNormal: this.gl.getAttribLocation(glslTextureLightShader.shaderProgram, 'aVertexNormal'),
                vertexTextureCoordinate: this.gl.getAttribLocation(glslTextureLightShader.shaderProgram, 'aVertexTextureCoordinate'),
            },
            uniformLocations: {
                sampler: this.gl.getUniformLocation(glslTextureLightShader.shaderProgram, 'uSampler'),
                projectionMatrix: this.gl.getUniformLocation(glslTextureLightShader.shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(glslTextureLightShader.shaderProgram, 'uModelViewMatrix'),
                modelMatrix: this.gl.getUniformLocation(glslTextureLightShader.shaderProgram, 'uModelMatrix'),
                normalMatrix: this.gl.getUniformLocation(glslTextureLightShader.shaderProgram, 'uNormalMatrix'),
                lightPosition: this.gl.getUniformLocation(glslTextureLightShader.shaderProgram, 'uLightPosition'),
                ambientLightColor: this.gl.getUniformLocation(glslTextureLightShader.shaderProgram, 'uAmbientLightColor'),
                diffuseLightColor: this.gl.getUniformLocation(glslTextureLightShader.shaderProgram, 'uDiffuseLightColor'),
            },
        };
        this.light = {
            lightPosition: {x: 8, y:0, z:10},
            diffuseLightColor: {r: 1, g: 0, b: 0},
            ambientLightColor: {r: 0, g: 0, b:1},
        };
        this.textureLightShaderInfo.light = this.light;

        document.getElementById('light-position').innerHTML = vectorToString(this.light.lightPosition);
		document.getElementById('diffuse-light-color').innerHTML = vectorToString(this.light.diffuseLightColor);
		document.getElementById('ambient-light').innerHTML = vectorToString(this.light.ambientLightColor);
    }

    handleKeys(elapsed) {
        super.handleKeys(elapsed);
        this.scooter.handleKeys(elapsed);
    }

    setLightProperties() {
        this.gl.useProgram(this.textureLightShaderInfo.program);
        this.gl.uniform3f(this.textureLightShaderInfo.uniformLocations.lightPosition, this.light.lightPosition.x, this.light.lightPosition.y, this.light.lightPosition.z);
        this.gl.uniform3f(this.textureLightShaderInfo.uniformLocations.diffuseLightColor, this.light.diffuseLightColor.r, this.light.diffuseLightColor.g, this.light.diffuseLightColor.b);
        this.gl.uniform3f(this.textureLightShaderInfo.uniformLocations.ambientLightColor, this.light.ambientLightColor.r, this.light.ambientLightColor.g, this.light.ambientLightColor.b);

    }

    draw(elapsed, modelMatrix = new Matrix4()) {
        super.draw(elapsed);
        this.setLightProperties();
        this.scooter.draw(this.baseShaderInfo, this.textureLightShaderInfo, elapsed, modelMatrix);
    }
}

