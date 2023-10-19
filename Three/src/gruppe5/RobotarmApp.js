import '../../static/style.css';
import * as THREE from "three";
import { Arm } from './Arm.js';
import { Box } from './Box.js';
import { CustomCamera } from './Camera.js';
import { Ground } from './Ground.js';

//Globalt objekt som er tilgjengelig fra alle funksjoner i denne Javascript-modulen/fila.
let ri = {};  //ri=renderInfo

export function main() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    // Renderer:
    ri.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    ri.renderer.setSize(window.innerWidth, window.innerHeight);

    // Scene
    ri.scene = new THREE.Scene();
    ri.scene.background = new THREE.Color( 0xdddddd );

    // Create a box instance
    let boxInstance = new Box();
    ri.scene.add(boxInstance.mesh);

    // Create a ground instance
    let groundInstance = new Ground(10, 1, 10);
    ri.scene.add(groundInstance.mesh);

    // Create a arm instance
    let armInstance = new Arm();
    ri.scene.add(armInstance.mesh);

    // Create a camera instance
    let cameraInstance = new CustomCamera();
    ri.scene.add(cameraInstance.camera);

    // Kamera:
    ri.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    ri.camera.position.x = 3;
    ri.camera.position.y = 3;
    ri.camera.position.z = 7;
    // Start animasjonsløkka:
    animate(0);
}


function animate(currentTime) {
    window.requestAnimationFrame((currentTime) => {
        animate(currentTime);
    });
    ri.renderer.render(ri.scene, ri.camera);
}
