import * as THREE from "three";
import { createAmmoRigidBody, phy } from '../utils/myAmmoHelper';
import { addMeshToScene } from '../utils/myThreeHelper';
import {
	COLLISION_GROUP_BOX,
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
    
        let plankRigidBody = this.createPlank(material, position, plankWidth, plankLength, plankDepth, radius, height);
        let baseRigidBody = this.createBase(material, position, radius, height);
    
        const plankPivot = new Ammo.btVector3(20, 0, 0);
        const plankAxis = new Ammo.btVector3(0, 1, 0);
        const basePivot = new Ammo.btVector3(0, 0, 0);
        const baseAxis = new Ammo.btVector3(0, 1, 0);
    
        const hingeConstraint = new Ammo.btHingeConstraint(
            baseRigidBody,
            plankRigidBody,
            basePivot,
            plankPivot,
            plankAxis,
            baseAxis,
            false
        );
 
        phy.ammoPhysicsWorld.addConstraint(hingeConstraint, false);
    }
    

    createPlank(material, position, plankWidth, plankLength, plankDepth, radius) {
        const plankMass = 20;
    
        // Creating the plank mesh
        const plankGeometry = new THREE.BoxGeometry(plankLength, plankWidth, plankDepth);
        const plankMesh = new THREE.Mesh(plankGeometry, material);
        plankMesh.position.set(position.x - 15, position.y + 50, position.z);
        plankMesh.rotation.set(Math.PI / 2, 0, 10 * Math.PI / 180);
        plankMesh.castShadow = true;
        plankMesh.receiveShadow = true;
    
        // Creating Ammo.js rigid body for the plank
        const shape = new Ammo.btBoxShape(new Ammo.btVector3(plankLength / 2, plankWidth / 2, plankDepth / 2));
        const plankRigidBody = createAmmoRigidBody(shape, plankMesh, 0.4, 0.6, plankMesh.position, plankMass);

        plankRigidBody.setRestitution(0.1);
        plankRigidBody.setFriction(0.8);
        plankRigidBody.setDamping(0.9, 0.9);

        let transform = new Ammo.btTransform();
        plankRigidBody.getMotionState().getWorldTransform(transform);
        transform.setOrigin(new Ammo.btVector3(plankMesh.position.x, plankMesh.position.y, plankMesh.position.z));
        plankRigidBody.getMotionState().setWorldTransform(transform);

        plankMesh.userData.physicsBody = plankRigidBody;

        phy.ammoPhysicsWorld.addRigidBody(
            plankRigidBody,
            COLLISION_GROUP_MOVEABLE,
            COLLISION_GROUP_BOX |
                COLLISION_GROUP_SPHERE |
                COLLISION_GROUP_MOVEABLE |
                COLLISION_GROUP_PLANE |
                COLLISION_GROUP_SPRING
        );

        addMeshToScene(plankMesh);
        phy.rigidBodies.push(plankMesh);
        plankRigidBody.threeMesh = plankMesh;

        return plankRigidBody;
    }
    
    createBase(material, position, radius, height) {
        const baseMass = 0;
    
        // Creating the cylinder mesh
        const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height/2, 32);
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, material);
        cylinderMesh.position.set(position.x, position.y + radius, position.z);
        cylinderMesh.rotation.set(Math.PI / 2, 0, 10 * Math.PI / 180);
        cylinderMesh.castShadow = true;
        cylinderMesh.receiveShadow = true;
    
        // Creating Ammo.js rigid body for the cylinder
        const shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height / 2, radius));
        shape.setMargin(0.05);
        const baseRigidBody = createAmmoRigidBody(shape, cylinderMesh, 0.4, 0.6, cylinderMesh.position, baseMass);
        cylinderMesh.userData.physicsBody = baseRigidBody;

        phy.ammoPhysicsWorld.addRigidBody(
            baseRigidBody,
            COLLISION_GROUP_BOX,
            COLLISION_GROUP_BOX |
                COLLISION_GROUP_SPHERE |
                COLLISION_GROUP_MOVEABLE |
                COLLISION_GROUP_PLANE |
                COLLISION_GROUP_SPRING
        );

        addMeshToScene(cylinderMesh);
        phy.rigidBodies.push(cylinderMesh);
        baseRigidBody.threeMesh = cylinderMesh;
    
        return baseRigidBody;
    }
}