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

        // Texture shader:
        let vertexShaderSource = document.getElementById('texture-vertex-shader').innerHTML;
        let fragmentShaderSource = document.getElementById('texture-fragment-shader').innerHTML;
        let lightvertexShaderSource = document.getElementById('diffuse-pointlight-gourad-vertex-shader').innerHTML;
		let lightfragmentShaderSource = document.getElementById('diffuse-pointlight-gourad-fragment-shader').innerHTML;
        // Initialiserer  & kompilerer shader-programmene;
        const glslTextureShader = new WebGLShader(this.gl, vertexShaderSource, fragmentShaderSource);
        // Samler all texture-shader-info i et JS-objekt.
        this.textureShaderInfo = {
            program: glslTextureShader.shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(glslTextureShader.shaderProgram, 'aVertexPosition'),
                vertexColor: this.gl.getAttribLocation(glslTextureShader.shaderProgram, 'aVertexColor'),
                vertexTextureCoordinate: this.gl.getAttribLocation(glslTextureShader.shaderProgram, 'aVertexTextureCoordinate'),
            },
            uniformLocations: {
                sampler: this.gl.getUniformLocation(glslTextureShader.shaderProgram, 'uSampler'),
                projectionMatrix: this.gl.getUniformLocation(glslTextureShader.shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(glslTextureShader.shaderProgram, 'uModelViewMatrix'),
            },
        };
        const glslShader = new WebGLShader(this.gl, lightvertexShaderSource, lightfragmentShaderSource);
        this.lightShaderInfo = {
            program: glslShader.shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
                vertexNormal: this.gl.getAttribLocation(glslShader.shaderProgram, 'aVertexNormal'),
                vertexTextureCoordinate: this.gl.getAttribLocation(glslShader.shaderProgram, 'aVertexTextureCoordinate'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
                modelMatrix: this.gl.getUniformLocation(glslShader.shaderProgram, 'uModelMatrix'),
                normalMatrix: this.gl.getUniformLocation(glslShader.shaderProgram, 'uNormalMatrix'),
    
                lightPosition: this.gl.getUniformLocation(glslShader.shaderProgram, 'uLightPosition'),
                ambientLightColor: this.gl.getUniformLocation(glslShader.shaderProgram, 'uAmbientLightColor'),
                diffuseLightColor: this.gl.getUniformLocation(glslShader.shaderProgram, 'uDiffuseLightColor'),
    
                sampler: this.gl.getUniformLocation(glslShader.shaderProgram, 'uSampler'),
            },
        };
        this.light = {
            lightPosition: {x: 10, y:6, z:0},
            diffuseLightColor: {r: 1, g: 0, b:0},
            ambientLightColor: {r: 0.2, g: 1, b:0.2},
        };
        document.getElementById('light-position').innerHTML = vectorToString(this.light.lightPosition);
		document.getElementById('diffuse-light-color').innerHTML = vectorToString(this.light.diffuseLightColor);
		document.getElementById('ambient-light').innerHTML = vectorToString(this.light.ambientLightColor);
    }

    handleKeys(elapsed) {
        super.handleKeys(elapsed);
        this.scooter.handleKeys(elapsed);
    }

    draw(elapsed, modelMatrix = new Matrix4()) {
        super.draw(elapsed);
        this.scooter.draw(this.baseShaderInfo, this.textureShaderInfo, elapsed, modelMatrix);
    }
}
