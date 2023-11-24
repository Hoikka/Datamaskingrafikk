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
        const x = FLOOR_ROOF_SIZE / 2 - 50;
        const y = WALL_HEIGHT / 2 - 100;
        const z = 0;
        
        this.createFunnel(x, y, z);
    }


    createFunnel(x, y, z) {
        console.log("Creating funnel");
        // Three.js funnel geometry and mesh
        const radiusTop = 50;
        const radiusBottom = 100;
        const height = 30;
        const radialSegments = 32;

        const funnelGeometry = new THREE.ConeGeometry(radiusTop, radiusBottom, height, radialSegments, 1, true);
        const funnelMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
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
        let rigidBody = createAmmoRigidBody(shape, funnelMesh, 0.7, 0.5, funnelMesh.position, mass);

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
        console.log(funnelMesh);
    }

} 