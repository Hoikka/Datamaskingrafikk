import * as THREE from "three";
import GUI from "lil-gui";  //NB! Må installeres før bruk: npm install --save lil-gui
import {applyImpulse, moveRigidBody} from "./myAmmoHelper";
import {createRandomSpheres} from "./threeAmmoShapes";
import {TrackballControls} from "three/examples/jsm/controls/TrackballControls";
import {ri} from "../script.js";

export function createThreeScene() {
	const canvas = document.createElement('canvas');
	document.body.appendChild(canvas);

	// Renderer:
	ri.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
	ri.renderer.setSize(window.innerWidth, window.innerHeight);
	ri.renderer.setClearColor(0xBFD104, 0xff);  //farge, alphaverdi.
	ri.renderer.shadowMap.enabled = true; //NB!
	ri.renderer.shadowMapSoft = true;
	ri.renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

	// Scene
	ri.scene = new THREE.Scene();
	ri.scene.background = new THREE.Color( 0xdddddd );

	// lil-gui kontroller:
	ri.lilGui = new GUI();

	// Sceneobjekter
	addLights();

	// Kamera:
	ri.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
	ri.camera.position.x = 30;
	ri.camera.position.y = 160;
	ri.camera.position.z = 100;

	// TrackballControls:
	ri.controls = new TrackballControls(ri.camera, ri.renderer.domElement);
	ri.controls.addEventListener( 'change', renderScene);
}

export function addLights() {
	// Ambient:
	let ambientLight1 = new THREE.AmbientLight(0xffffff, 0.7);
	ambientLight1.visible = true;
	ri.scene.add(ambientLight1);
	const ambientFolder = ri.lilGui.addFolder( 'Ambient Light' );
	ambientFolder.add(ambientLight1, 'visible').name("On/Off");
	ambientFolder.add(ambientLight1, 'intensity').min(0).max(1).step(0.01).name("Intensity");
	ambientFolder.addColor(ambientLight1, 'color').name("Color");

	//** RETNINGSORIENTERT LYS (som gir skygge):
	let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLight.visible = true;
	directionalLight.position.set(0, 105, 0);
	// Viser lyskilden:
	const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, 10, 0xff0000);
	directionalLightHelper.visible = true;
	ri.scene.add(directionalLightHelper);
	directionalLight.castShadow = true;     //Merk!
	directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;
	directionalLight.shadow.camera.near = 5;
	directionalLight.shadow.camera.far = 110;
	directionalLight.shadow.camera.left = -50;
	directionalLight.shadow.camera.right = 50;
	directionalLight.shadow.camera.top = 50;
	directionalLight.shadow.camera.bottom = -50;
	ri.scene.add(directionalLight);
	// Viser lyskildekamera (hva lyskilden "ser")
	const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
	directionalLightCameraHelper.visible = true;

	ri.scene.add(directionalLightCameraHelper);

	//lil-gui:
	const directionalFolder = ri.lilGui.addFolder( 'Directional Light' );
	directionalFolder.add(directionalLight, 'visible').name("On/Off");
	directionalFolder.add(directionalLight, 'intensity').min(0).max(1).step(0.01).name("Intensity");
	directionalFolder.addColor(directionalLight, 'color').name("Color");
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
export function onMouseClick(event) {
    // Convert the mouse position to normalized device coordinates (-1 to +1) for the raycaster
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, ri.camera);

	const buttonMesh = ri.scene.getObjectByName('button');
    if (buttonMesh) {

		// Calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObjects([buttonMesh]);

		if (intersects.length > 0) {
			// Button was clicked
			ri.scene.startBox.pushButton(intersects[0].object);
		}
	}
}


//Sjekker tastaturet:
export function handleKeys(delta) {
	if (ri.currentlyPressedKeys['KeyH']) {	//H
		createRandomSpheres(200);
	}
	if (ri.currentlyPressedKeys['KeyU']) {	//H
		const cube = ri.scene.getObjectByName("cube");
		applyImpulse(cube.userData.physicsBody, 50, {x:0, y:1, z:0});
	}

	const movable = ri.scene.getObjectByName("movable");
	if (ri.currentlyPressedKeys['KeyA']) {	//A
		moveRigidBody(movable,{x: -0.2, y: 0, z: 0});
	}
	if (ri.currentlyPressedKeys['KeyD']) {	//D
		moveRigidBody(movable,{x: 0.2, y: 0, z: 0});
	}
	if (ri.currentlyPressedKeys['KeyW']) {	//W
		moveRigidBody(movable,{x: 0, y: 0, z: -0.2});
	}
	if (ri.currentlyPressedKeys['KeyS']) {	//S
		moveRigidBody(movable,{x: 0, y: 0, z: 0.2});
	}
}

export function onWindowResize() {
	ri.camera.aspect = window.innerWidth / window.innerHeight;
	ri.camera.updateProjectionMatrix();
	ri.renderer.setSize(window.innerWidth, window.innerHeight);
	ri.controls.handleResize();
	renderScene();
}

export function updateThree(deltaTime) {
	//Oppdater trackball-kontrollen:
	ri.controls.update();
}

export function addMeshToScene(mesh) {
	ri.scene.add(mesh);
}

export function renderScene()
{
	ri.renderer.render(ri.scene, ri.camera);
}

export function getRigidBodyFromMesh(meshName) {
	const mesh = ri.scene.getObjectByName(meshName);
	if (mesh)
		return mesh.userData.physicsBody;
	else
		return null;
}

// Function to create and return a textured mesh
export function createTexturedMesh(geometry, texturePath) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    return new THREE.Mesh(geometry, material);
}