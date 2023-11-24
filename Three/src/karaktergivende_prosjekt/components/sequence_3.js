import * as THREE from "three";
import { createAmmoRigidBody, phy } from '../utils/myAmmoHelper';
import { addMeshToScene, createTexturedMesh } from '../utils/myThreeHelper';
import { createConvexTriangleShapeAddToCompound, createTriangleShapeAddToCompound } from "../utils/triangleMeshHelpers";
import { WALL_HEIGHT, FLOOR_ROOF_SIZE } from '../script';
import {
	COLLISION_GROUP_BOX, COLLISION_GROUP_HINGE_SPHERE,
	COLLISION_GROUP_MOVEABLE,
	COLLISION_GROUP_PLANE,
	COLLISION_GROUP_SPHERE,
	COLLISION_GROUP_SPRING
} from "../utils/myAmmoHelper";

export class Swing {
    constructor() {
        const x = 350;
        const y = 0;
        const z = -30;

        let position = { x: x, y: y, z: z };

        this.createSwing(position);
        
    }

    createSwing(position) {
        const plankLength = 200;
        const plankWidth = 50;
        const plankDepth = 10;
        const radius = 10;
        const height = 200;

        let material = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

        let plankRigidBody = this.createPlank(material, position, plankWidth, plankLength, plankDepth, radius);
        let baseRigidBody = this.createBase(material, position, radius, height);

        // Legger til physics world:
        phy.ammoPhysicsWorld.addRigidBody(
            plankRigidBody,
            COLLISION_GROUP_MOVEABLE,
            COLLISION_GROUP_BOX |
                COLLISION_GROUP_SPHERE |
                COLLISION_GROUP_MOVEABLE |
                COLLISION_GROUP_PLANE |
                COLLISION_GROUP_SPRING
        );

        phy.ammoPhysicsWorld.addRigidBody(
            baseRigidBody,
            COLLISION_GROUP_BOX,
            COLLISION_GROUP_BOX |
                COLLISION_GROUP_SPHERE |
                COLLISION_GROUP_MOVEABLE |
                COLLISION_GROUP_PLANE |
                COLLISION_GROUP_SPRING
        );

        //Pivotpunkt: rigidBodyCube "koples til" nedre, venstre, ytre hjørne av rigidBodyAnchor
        let plankPivot = new Ammo.btVector3( -plankWidth/2, -plankLength/2, plankDepth/2 );
        let basePivot = new Ammo.btVector3( -radius/2, height/2, plankDepth/2 );

        let p2pConstraint = new Ammo.btPoint2PointConstraint( baseRigidBody, plankRigidBody, plankPivot, basePivot);
        phy.ammoPhysicsWorld.addConstraint( p2pConstraint, false );
    }

    createPlank(material, position, plankWidth, plankLength, plankDepth, radius) {
        const plankMass = 10; // A non-zero mass makes the plank dynamic
    
        // Creating the plank mesh
        const plankGeometry = new THREE.BoxGeometry(plankLength, plankWidth, plankDepth);
        const plankMesh = new THREE.Mesh(plankGeometry, material);
        plankMesh.position.set(position.x, position.y + radius*2, position.z);
        plankMesh.rotation.set(Math.PI / 2, 0, 10 * Math.PI / 180);
    
        // Creating Ammo.js rigid body for the plank
        const shape = new Ammo.btBoxShape(new Ammo.btVector3(plankLength / 2, plankWidth / 2, plankDepth / 2));
        const plankRigidBody = createAmmoRigidBody(shape, plankMesh, 0.4, 0.6, plankMesh.position, plankMass);
        plankMesh.userData.physicsBody = plankRigidBody;

        addMeshToScene(plankMesh);
    
        return plankRigidBody;
    }
    
    createBase(material, position, radius, height) {
        const baseMass = 0; // Zero mass for static objects
    
        // Creating the cylinder mesh
        const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, material);
        cylinderMesh.position.set(position.x, position.y + radius, position.z);
        cylinderMesh.rotation.set(Math.PI / 2, 0, 10 * Math.PI / 180);
    
        // Creating Ammo.js rigid body for the cylinder
        const shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height / 2, radius));
        const baseRigidBody = createAmmoRigidBody(shape, cylinderMesh, 0.4, 0.6, cylinderMesh.position, baseMass);
        cylinderMesh.userData.physicsBody = baseRigidBody;

        addMeshToScene(cylinderMesh);
    
        return baseRigidBody;
    }
    
}