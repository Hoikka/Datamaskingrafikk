import '../../static/style.css';
import * as THREE from "three";
import Stats from 'stats.js';

import {
	createThreeScene,
	handleKeys,
	onWindowResize,
	renderScene,
	updateThree
} from "./utils/myThreeHelper.js";

import {
	createAmmoWorld,
	updatePhysics
} from "./utils/myAmmoHelper.js";

import {
	createAmmoCube,
	createAmmoSpheres,
	createAmmoXZPlane,
	createMovable,
} from "./utils/threeAmmoShapes.js";


//Globale variabler:
//MERK: Denne brukes også i myThreeHelper:
export const ri = {
	currentlyPressedKeys: [],
	scene: undefined,
	renderer: undefined,
	camera: undefined,
	clock: undefined,
	controls: undefined,
	lilGui: undefined,
	stats: undefined
};

export const XZPLANE_SIDELENGTH = 100;



export function main() {

	ri.stats = new Stats();
	ri.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( ri.stats.dom );

	//Input - standard Javascript / WebGL:
	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

	// three:
	createThreeScene();

	// ammo
	createAmmoWorld(true);  //<<=== MERK!

	// Klokke for animasjon
	ri.clock = new THREE.Clock();

	//Håndterer endring av vindusstørrelse:
	window.addEventListener('resize', onWindowResize, false);

	//Input - standard Javascript / WebGL:
	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

	// three/ammo-objekter:
	addAmmoSceneObjects();
}

function handleKeyUp(event) {
	ri.currentlyPressedKeys[event.code] = false;
}

function handleKeyDown(event) {
	ri.currentlyPressedKeys[event.code] = true;
}

function addAmmoSceneObjects() {
	createAmmoXZPlane();
	createAmmoSpheres(20);
	createAmmoCube();
	createMovable();

	animate(0);
}

function animate(currentTime, myThreeScene, myAmmoPhysicsWorld) {
	window.requestAnimationFrame((currentTime) => {
		animate(currentTime, myThreeScene, myAmmoPhysicsWorld);
	});
	let deltaTime = ri.clock.getDelta();

	ri.stats.begin();

	//Oppdaterer grafikken:
	updateThree(deltaTime);

	//Oppdaterer fysikken:
	updatePhysics(deltaTime);

	//Sjekker input:
	handleKeys(deltaTime);

	//Tegner scenen med gitt kamera:
	renderScene();
	ri.stats.end();
}
