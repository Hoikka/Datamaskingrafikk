import '../../static/style.css';
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import GUI from 'lil-gui'; //NB! Må installeres før bruk: npm install --save lil-gui

//Globalt objekt som er tilgjengelig fra alle funksjoner i denne Javascript-modulen/fila.
let ri = {
    currentlyPressedKeys: []
};

export function main() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    // Renderer:
    ri.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    ri.renderer.setSize(window.innerWidth, window.innerHeight);
    ri.renderer.shadowMap.enabled = true; //NB!
    ri.renderer.shadowMapSoft = true;
    ri.renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

    // Scene
    ri.scene = new THREE.Scene();
    ri.scene.background = new THREE.Color( 0xdddddd );

    // Lys
    // lil-gui kontroller:
	ri.lilGui = new GUI();
    addLights();  // Lager rød strek

    // Kamera:
    ri.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    ri.camera.position.x = 300;
    ri.camera.position.y = 150;
    ri.camera.position.z = 0;

    // TrackballControls:
    ri.controls = new TrackballControls(ri.camera, ri.renderer.domElement);
    ri.controls.addEventListener( 'change', renderScene);

    // Klokke for animasjon
    ri.clock = new THREE.Clock();

    //Håndterer endring av vindusstørrelse:
    window.addEventListener('resize', onWindowResize, false);

    // Sceneobjekter
    addSceneObjects();

}

function addSceneObjects() {
    // Add objects here

    // Start animasjonsløkka:
    animate(0);
}

function addLights() {
    // Add lights here
}

function animate(currentTime) {
    requestAnimationFrame(animate);
    renderScene();
}


function renderScene() {
    ri.renderer.render(ri.scene, ri.camera);
}

function onWindowResize() {
    ri.camera.aspect = window.innerWidth / window.innerHeight;
    ri.camera.updateProjectionMatrix();
    ri.renderer.setSize(window.innerWidth, window.innerHeight);
    ri.controls.handleResize();
    renderScene();
}