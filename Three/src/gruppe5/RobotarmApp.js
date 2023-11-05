import '../../static/style.css';
import * as THREE from "three";
import { Arm } from './arm.js';
import { Claw } from './claw.js';
import { Ground } from './ground.js';
import { Box, Cylinder } from './movableObject.js';
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import GUI from 'lil-gui'; //NB! Må installeres før bruk: npm install --save lil-gui

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
    // lil-gui kontroller:
	ri.lilGui = new GUI();
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
    // Create a box instance (red)
    let materialRed = new THREE.MeshStandardMaterial({color:0xFF0000,side: THREE.DoubleSide, wireframe: false});
    let geometryBox = new THREE.BoxGeometry(10,20,10)
    let boxInstance = new THREE.Mesh(geometryBox,materialRed)

    boxInstance.position.set(0,10,0)
    boxInstance.castShadow = true;
    boxInstance.receiveShadow=true;
    ri.scene.add(boxInstance);
    
    // Create a cylinder instance ( blue)
    let geometryCylinder = new THREE.CylinderGeometry(7, 7, 20, 32)
    let materialBlue = new THREE.MeshStandardMaterial({color:0x0000FF ,side: THREE.DoubleSide, wireframe: false});
    let cylinderInstance = new THREE.Mesh(geometryCylinder,materialBlue);

    cylinderInstance.position.set(0,10,50);
    cylinderInstance.castShadow=true;
    cylinderInstance.receiveShadow=true;
    ri.scene.add(cylinderInstance);

    //clone of cylinder (yellow)
    let cylinderClone = geometryCylinder.clone();
    let materialYellow = new THREE.MeshStandardMaterial({color:0xFFFF00,side: THREE.DoubleSide, wireframe: false});
    let cylinderCloneInstance = new THREE.Mesh(cylinderClone,materialYellow);

    cylinderCloneInstance.position.set(0,10,-50);
    cylinderCloneInstance.castShadow=true;
    cylinderCloneInstance.receiveShadow=true;
    ri.scene.add(cylinderCloneInstance);

    // Create a ground instance
    let groundInstance = new Ground(170, 10, 300);
    ri.scene.add(groundInstance.mesh);
    groundInstance.mesh.receiveShadow=true;
    // Roof using ground instance
    let roofInstance = new Ground(100, 10, 400);
    //change the Y to move it to the roof
    roofInstance.mesh.position.setY(180)
    ri.scene.add(roofInstance.mesh);

    // Create the Arm and load its textures
    ri.armInstance = new Arm();
    ri.armInstance.loadTexture((armMesh) => {
        ri.scene.add(armMesh);
    });
    let cameraAnchor = ri.armInstance.getCameraPosition();
    cameraAnchor.add(ri.clawCamera);

    // Create the claw
    ri.clawInstance = new Claw();
    ri.clawInstance.loadTexture((clawMesh) => {
        let extensionPart = ri.armInstance.getMeshExtension();
        extensionPart.add(clawMesh);

        clawMesh.position.set(0, -40, 0);
        clawMesh.rotation.set(0, 0, 0);
    });

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

    //lil-gui:
	const directionalFolder = ri.lilGui.addFolder( 'Directional Light' );
	directionalFolder.add(directionalLight1, 'visible').name("On/Off").onChange(value => {
		directionalLightHelper.visible = value;
		lightCamHelper.visible = value;
	});
	directionalFolder.add(directionalLight1, 'intensity').min(0).max(1).step(0.01).name("Intensity");
	directionalFolder.addColor(directionalLight1, 'color').name("Color");

    //pointlight (white colour)
    let pointLight1 = new THREE.PointLight(0xffffff,10000);
    pointLight1.position.set(0,170,100);
    pointLight1.shadow.camera.near = 10;
	pointLight1.shadow.camera.far = 300;
	pointLight1.shadow.mapSize.width = 1024;
	pointLight1.shadow.mapSize.width = 1024;
    pointLight1.castShadow= true;
    //visual of light source
    const pointLightHelper = new THREE.PointLightHelper(pointLight1,10,0xffffff);
    pointLightHelper.visible = true;

    const pointLightCameraHelper = new THREE.CameraHelper(pointLight1.shadow.camera)
	pointLightCameraHelper.visible = true;
	ri.scene.add(pointLightCameraHelper);

    ri.scene.add(pointLightHelper);
    ri.scene.add(pointLight1);

    //lil-gui (pointlight):
	const pointLigthFolder = ri.lilGui.addFolder( 'Pointlight' );
	pointLigthFolder.add(pointLight1, 'visible').name("On/Off").onChange(value => {
		pointLightHelper.visible = value;
		pointLightCameraHelper.visible = value;
	});
	pointLigthFolder.add(pointLight1, 'intensity').min(0).max(10000).step(10).name("Intensity");
	pointLigthFolder.addColor(pointLight1, 'color').name("Color");
	pointLigthFolder.add(pointLight1.position, 'y').min(10).max(170).step(5).name("Height");
    
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
    ri.clawInstance.animate(delta);

    renderScene();
}

function handleKeys(elapsed) {
    ri.armInstance.currentlyPressedKeys = ri.currentlyPressedKeys;
    ri.armInstance.handleKeys(elapsed);

    ri.clawInstance.currentlyPressedKeys = ri.currentlyPressedKeys;
    ri.clawInstance.handleKeys(elapsed);
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
