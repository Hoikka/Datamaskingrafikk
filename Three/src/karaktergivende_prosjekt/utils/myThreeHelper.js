import * as THREE from "three";
import GUI from "lil-gui";  //NB! Må installeres før bruk: npm install --save lil-gui
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

export function addSpotlight(mesh) {
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.castShadow = true;
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 500;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    ri.scene.add(spotLight);

    // Store the spotlight for later use
    ri.spotLight = spotLight;

    // Update the position of the spotlight to follow the ball
    ri.spotLight.position.copy(mesh.position);
    ri.spotLight.target = mesh;

	const spotLightFolder = ri.lilGui.addFolder('Spotlight');
	spotLightFolder.add(ri.spotLight, 'intensity', 0, 2).name('Intensity');
	spotLightFolder.addColor(ri.spotLight, 'color').name('Color');
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

export function trackObjectWithCameraAndLight(objectToTrack) {
    // Check if the object exists
    if (!objectToTrack) return;

    // Update Camera position
    if (ri.camera) {
        const offset = new THREE.Vector3(-100, 100, 100); // Adjust this offset as needed
        ri.camera.position.copy(objectToTrack.position).add(offset);
        ri.camera.lookAt(objectToTrack.position);
    }

    // Update Spotlight position
    if (ri.spotLight) {
        ri.spotLight.position.copy(objectToTrack.position);
        ri.spotLight.target = objectToTrack;
        ri.spotLight.target.updateMatrixWorld();
    }
}
