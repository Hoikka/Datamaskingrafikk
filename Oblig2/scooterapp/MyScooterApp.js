import {BaseApp} from '../../base/BaseApp.js';
import {Scooter} from '../scooter/scooter.js';
import {WebGLShader} from "../../base/helpers/WebGLShader.js";

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
