import '../../static/style.css';
import * as THREE from "three";
import { Arm } from './arm.js';
import { Ground } from './ground.js';
import { Box, Cylinder } from './movableObject.js';
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

//Globalt objekt som er tilgjengelig fra alle funksjoner i denne Javascript-modulen/fila.
let ri = {
    currentlyPressedKeys: []
};  //ri=renderInfo

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
    addLights();  // Lager rød strek

    // Kamera:
    ri.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    ri.camera.position.x = 300;
    ri.camera.position.y = 150;
    ri.camera.position.z = 0;

    // Claw camera
    const clawCameraCanvas = document.getElementById('clawCameraCanvas');
    ri.clawCameraRenderer = new THREE.WebGLRenderer({canvas: clawCameraCanvas, antialias: true});
    ri.clawCameraRenderer.setSize(clawCameraCanvas.clientWidth, clawCameraCanvas.clientHeight);

    ri.clawCamera = new THREE.PerspectiveCamera(75, clawCameraCanvas.clientWidth / clawCameraCanvas.clientHeight, 1, 1000);
    ri.clawCamera.lookAt(new THREE.Vector3(0, -50, 0)); // Look slightly ahead

    // TrackballControls:
    ri.controls = new TrackballControls(ri.camera, ri.renderer.domElement);
    ri.controls.addEventListener( 'change', renderScene);

    // Klokke for animasjon
    ri.clock = new THREE.Clock();

    //Håndterer endring av vindusstørrelse:
    window.addEventListener('resize', onWindowResize, false);

    //Håndterer events
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    // Sceneobjekter
    addSceneObjects();
}

function handleKeyUp(event) {
    ri.currentlyPressedKeys[event.code] = false;
}

function handleKeyDown(event) {
    ri.currentlyPressedKeys[event.code] = true;
}

function addSceneObjects() {
    // Create a box instance
    let boxInstance = new Box();
    ri.scene.add(boxInstance);
    
    // Create a cylinder instance
    let cylinderInstance = new Cylinder();
    cylinderInstance.move(0, 5, 40);
    ri.scene.add(cylinderInstance);

    // Create a ground instance
    let groundInstance = new Ground(100, 10, 300);
    ri.scene.add(groundInstance.mesh);

    // Create the Arm and load its textures
    ri.armInstance = new Arm();
    ri.armInstance.loadTexture((armMesh) => {
        ri.scene.add(armMesh);
    });
    let cameraAnchor = ri.armInstance.getCameraPosition();
    cameraAnchor.add(ri.clawCamera);

    // Start animasjonsløkka:
    animate(0);
}

function addLights() {
    //Retningsorientert lys (som gir skygge):
    let directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
    directionalLight1.position.set(90, 300, 0);
    directionalLight1.castShadow = true;

    // Viser lyskilden:
    const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight1, 10, 0xff0000);
    directionalLightHelper.visible = true;
    ri.scene.add(directionalLightHelper);
    // Setter verdier til shadow camera:
    directionalLight1.shadow.camera.near = 0;
    directionalLight1.shadow.camera.far = 401;
    directionalLight1.shadow.camera.left = -250;
    directionalLight1.shadow.camera.right = 250;
    directionalLight1.shadow.camera.top = 250;
    directionalLight1.shadow.camera.bottom = -250;
    //Hjelpeklasse for å vise lysets utstrekning:
    let lightCamHelper = new THREE.CameraHelper( directionalLight1.shadow.camera );
    lightCamHelper.visible = false;
    ri.scene.add( lightCamHelper );

    ri.scene.add(directionalLight1);
}

function animate(currentTime) {
    window.requestAnimationFrame((currentTime) => {
        animate(currentTime);
    });

    let delta = ri.clock.getDelta();

    //Oppdater trackball-kontrollen:
    ri.controls.update();

    // Checks input
    handleKeys(delta);

    // Update the arm
    ri.armInstance.animate(delta);

    renderScene();
}

function handleKeys(elapsed) {
    ri.armInstance.currentlyPressedKeys = ri.currentlyPressedKeys;
    ri.armInstance.handleKeys(elapsed);
}

function renderScene()
{
    ri.renderer.render(ri.scene, ri.camera);
    ri.clawCameraRenderer.render(ri.scene, ri.clawCamera);
}

function onWindowResize() {
    ri.camera.aspect = window.innerWidth / window.innerHeight;
    ri.camera.updateProjectionMatrix();
    ri.renderer.setSize(window.innerWidth, window.innerHeight);
    ri.controls.handleResize();
    renderScene();
}
