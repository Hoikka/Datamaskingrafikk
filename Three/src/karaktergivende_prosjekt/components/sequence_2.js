import * as THREE from "three";
import { createAmmoRigidBody, phy } from '../utils/myAmmoHelper';
import { addMeshToScene, createTexturedMesh } from '../utils/myThreeHelper';
import { WALL_HEIGHT, FLOOR_ROOF_SIZE } from '../script';
import {
	COLLISION_GROUP_BOX, COLLISION_GROUP_HINGE_SPHERE,
	COLLISION_GROUP_MOVEABLE,
	COLLISION_GROUP_PLANE,
	COLLISION_GROUP_SPHERE,
	COLLISION_GROUP_SPRING
} from "../utils/myAmmoHelper";


export class FunnelTubeSystem {
    constructor() {
        const x = 100;
        const y = 100;
        const z = 10;
        
        this.createFunnel(x, y, z);
    }


    createFunnel(x, y, z) {
        console.log("Creating funnel");
        // Three.js funnel geometry and mesh
        const radiusTop = 50;
        const radiusBottom = 100;
        const height = 300;
        const radialSegments = 32;

        const funnelGeometry = new THREE.ConeGeometry(radiusTop, radiusBottom, height, radialSegments, 1, true);
        const funnelMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });
        const funnelMesh = new THREE.Mesh(funnelGeometry, funnelMaterial);

        // Position the funnel
        funnelMesh.position.set(x , y, z);
        funnelMesh.rotation.x = -Math.PI; // Rotate to make the funnel's opening face upwards
        funnelMesh.castShadow = true;
        funnelMesh.receiveShadow = true;
        funnelMesh.name = 'funnel';

        // Ammo.js physics for the funnel
        const shape = new Ammo.btConeShape(radiusBottom, height);
        const mass = 0; // Mass of 0 for static objects
        const rigidBody = createAmmoRigidBody(shape, funnelMesh, mass);

        funnelMesh.userData.physicsBody = rigidBody;
        phy.ammoPhysicsWorld.addRigidBody(rigidBody,
            COLLISION_GROUP_BOX,
            COLLISION_GROUP_BOX |
                COLLISION_GROUP_SPHERE |
                COLLISION_GROUP_MOVEABLE |
                COLLISION_GROUP_PLANE |
                COLLISION_GROUP_SPRING);

        addMeshToScene(funnelMesh);
        phy.rigidBodies.push(funnelMesh);
        console.log(funnelMesh)
    }

    createTube() {

    }
} 