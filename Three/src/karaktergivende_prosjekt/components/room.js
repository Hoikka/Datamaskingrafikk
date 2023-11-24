import * as THREE from 'three';
import { addMeshToScene, createTexturedMesh } from '../utils/myThreeHelper';
import { createAmmoRigidBody, phy } from '../utils/myAmmoHelper';
import { WALL_HEIGHT, FLOOR_ROOF_SIZE } from '../script';
import {
	COLLISION_GROUP_BOX,COLLISION_GROUP_HINGE_SPHERE,
	COLLISION_GROUP_MOVEABLE,
	COLLISION_GROUP_PLANE,
	COLLISION_GROUP_SPHERE,
	COLLISION_GROUP_SPRING
} from "../utils/myAmmoHelper";


// Function to create the floor
function createFloor() {
	const mass=0;
	const position = {x: 0, y: 0, z: 0};

	// THREE:
	const floorGeometry = new THREE.PlaneGeometry( FLOOR_ROOF_SIZE, FLOOR_ROOF_SIZE, 1, 1 );
	floorGeometry.rotateX( -Math.PI / 2 );
    const floorMesh = createTexturedMesh(floorGeometry, '../../../assets/textures/tile1.png');
	floorMesh.receiveShadow = true;

	// AMMO:
	let shape = new Ammo.btBoxShape(new Ammo.btVector3(FLOOR_ROOF_SIZE/2, 0, FLOOR_ROOF_SIZE/2));
	//shape.setMargin( 0.05 );
	let rigidBody = createAmmoRigidBody(shape, floorMesh, 0.7, 0.8, position, mass);

	floorMesh.userData.physicsBody = rigidBody;

	// Legger til physics world:
	phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_PLANE,
        COLLISION_GROUP_BOX |
            COLLISION_GROUP_SPHERE |
            COLLISION_GROUP_MOVEABLE |
            COLLISION_GROUP_PLANE |
            COLLISION_GROUP_SPRING);

	addMeshToScene(floorMesh);
	phy.rigidBodies.push(floorMesh);
	rigidBody.threeMesh = floorMesh; //Brukes til collision events:
}

// Create walls
function createWalls() {
    const wallThickness = 1;

    const wallPositions = [
        new THREE.Vector3(0, WALL_HEIGHT / 2, -FLOOR_ROOF_SIZE / 2), // Back
        new THREE.Vector3(0, WALL_HEIGHT / 2, FLOOR_ROOF_SIZE / 2),  // Front
        new THREE.Vector3(-FLOOR_ROOF_SIZE / 2, WALL_HEIGHT / 2, 0), // Left
        new THREE.Vector3(FLOOR_ROOF_SIZE / 2, WALL_HEIGHT / 2, 0)   // Right
    ];

    const wallRotations = [
        new THREE.Euler(0, 0, 0), // Back
        new THREE.Euler(0, Math.PI, 0), // Front
        new THREE.Euler(0, Math.PI / 2, 0), // Left
        new THREE.Euler(0, -Math.PI / 2, 0) // Right
    ];

    for (let i = 0; i < 4; i++) {
        let wallGeometry = new THREE.BoxGeometry(FLOOR_ROOF_SIZE, WALL_HEIGHT, wallThickness);
        let wallMesh = createTexturedMesh(wallGeometry, '../../../assets/textures/tile2.png');
        wallMesh.position.copy(wallPositions[i]);
        wallMesh.rotation.copy(wallRotations[i]);
        wallMesh.receiveShadow = true;
        wallMesh.name = 'wall ' + i;

        // AMMO:
        let wallShape = new Ammo.btBoxShape(new Ammo.btVector3(FLOOR_ROOF_SIZE / 2, WALL_HEIGHT / 2, wallThickness / 2));
        let rigidBody = createAmmoRigidBody(wallShape, wallMesh, 0, 0.5, wallMesh.position, 0); // Use the wallMesh's position

        wallMesh.userData.physicsBody = rigidBody;
        phy.ammoPhysicsWorld.addRigidBody(rigidBody);

        addMeshToScene(wallMesh);
        phy.rigidBodies.push(wallMesh);
    };
}

// Create roof
function createRoof() {
    const roofGeometry = new THREE.PlaneGeometry(FLOOR_ROOF_SIZE, FLOOR_ROOF_SIZE);
    const roofMesh = createTexturedMesh(roofGeometry, '../../../assets/textures/water.jpg');
    
    roofMesh.position.y = WALL_HEIGHT
    roofMesh.rotation.x = Math.PI / 2;
    roofMesh.receiveShadow = true;
    
    // AMMO:
    let roofShape = new Ammo.btBoxShape(new Ammo.btVector3(FLOOR_ROOF_SIZE / 2, 0.1, FLOOR_ROOF_SIZE / 2)); // Thin box for roof
    let rigidBody = createAmmoRigidBody(roofShape, roofMesh, 0, 0.5, { x: 0, y: WALL_HEIGHT, z: 0 }, 0); // mass = 0 for static body
    
    // Add to physics world
    roofMesh.userData.physicsBody = rigidBody;
    phy.ammoPhysicsWorld.addRigidBody(rigidBody);
    
    addMeshToScene(roofMesh);
    phy.rigidBodies.push(roofMesh);
}

// Function to construct the entire room
export function createRoom() {
    createFloor();
    createWalls();
    createRoof();
}