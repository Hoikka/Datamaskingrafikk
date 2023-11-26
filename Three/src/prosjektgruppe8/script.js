import '../../static/style.css';
import * as THREE from "three";
import Stats from 'stats.js';
import * as TWEEN from '@tweenjs/tween.js'   // HUSK: npm install @tweenjs/tween.js

import { Ball } from './components/ball.js';
import { createRoom } from "./components/room.js";
import { StartBox } from './components/sequence_1';
import { FunnelTubeSystem } from './components/sequence_2.js';
import { Swing } from './components/sequence_3.js';

export const WALL_HEIGHT = 500;
export const FLOOR_ROOF_SIZE = 1000;

import {
	createThreeScene,
	onMouseClick,
	onWindowResize,
	renderScene,
	updateThree,
	trackObjectWithCameraAndLight
} from "./utils/myThreeHelper.js";

import {
	createAmmoWorld,
	updatePhysics
} from "./utils/myAmmoHelper.js";


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
	stats: undefined,
	spotLight: undefined,
	trackedObject: undefined,
};


export function main() {

	ri.stats = new Stats();
	ri.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( ri.stats.dom );

	//Input - standard Javascript / WebGL:
	document.addEventListener('click', onMouseClick);

	// three:
	createThreeScene();

	// ammo
	createAmmoWorld(true);  //<<=== MERK!

	// Klokke for animasjon
	ri.clock = new THREE.Clock();

	//Håndterer endring av vindusstørrelse:
	window.addEventListener('resize', onWindowResize, false);

	// three/ammo-objekter:
	addAmmoSceneObjects();
}

function addAmmoSceneObjects() {
	createRoom(ri.scene);
	ri.scene.startBox = new StartBox();
	ri.scene.ball = new Ball();
	ri.trackedObject = ri.scene.ball.mesh;

	ri.scene.funnelTubeSystem = new FunnelTubeSystem();
	ri.scene.swing = new Swing();

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

	// Tween
	TWEEN.update();

	// Oppdaterer kamera og lys:
	trackObjectWithCameraAndLight(ri.trackedObject);

	//Tegner scenen med gitt kamera:
	renderScene();

	onMouseClick(deltaTime);

	ri.stats.end();
}
