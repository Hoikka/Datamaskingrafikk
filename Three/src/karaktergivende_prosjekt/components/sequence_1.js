import * as THREE from 'three';
import { createAmmoRigidBody, phy } from '../utils/myAmmoHelper';
import { addMeshToScene, createTexturedMesh } from '../utils/myThreeHelper';
import { WALL_HEIGHT, FLOOR_ROOF_SIZE } from '../script';
import * as TWEEN from '@tweenjs/tween.js'   // HUSK: npm install @tweenjs/tween.js
import {
	COLLISION_GROUP_BOX, 
	COLLISION_GROUP_MOVEABLE,
	COLLISION_GROUP_PLANE,
	COLLISION_GROUP_SPHERE,
	COLLISION_GROUP_SPRING
} from "../utils/myAmmoHelper";


export const BOX_HEIGHT = 50;

export class StartBox {
    constructor() {
        this.isOpen = false;

        const wallCenterX = FLOOR_ROOF_SIZE / 2;
        const wallCenterY = WALL_HEIGHT / 2;

        this.hingeConstraint = null;

        this.createBox(wallCenterX, wallCenterY, 0);
        this.button = this.createButton(wallCenterX, wallCenterY, 0);
        this.bottom = this.createHingedBoxBottom(wallCenterX, wallCenterY, 0);
    }


    createBox(x, y, z) {
        const boxThickness = 0.01;
        const boxHeight = BOX_HEIGHT;
        x -= boxHeight / 2; // Adjust for the center of the box

        const panelPositions = [
            new THREE.Vector3(x, y + boxHeight / 2, z), // Top
            new THREE.Vector3(x, y, z - boxHeight / 2),  // Front
            new THREE.Vector3(x - boxHeight / 2, y, z),  // Left
            new THREE.Vector3(x, y, z + boxHeight / 2)   // Right
        ];


        const panelRotations = [
            new THREE.Euler(-Math.PI / 2, 0, 0), // Top
            new THREE.Euler(0, 0, 0), // Front
            new THREE.Euler(0, Math.PI / 2, 0), // Left
            new THREE.Euler(0, 0, 0) // Right
        ];

        for (let i = 0; i < panelPositions.length; i++) {
            let panelGeometry = new THREE.BoxGeometry(boxHeight, boxHeight, boxThickness);
            let panelMesh = createTexturedMesh(panelGeometry, '../../../assets/textures/bricks2.jpg');
            panelMesh.position.copy(panelPositions[i]);
            panelMesh.rotation.copy(panelRotations[i]);
            panelMesh.castShadow = true;
            panelMesh.receiveShadow = true;
            panelMesh.name = 'box_panel ' + i;
    
            // Create Ammo.js rigid body for the panel
            let panelShape = new Ammo.btBoxShape(new Ammo.btVector3(
                boxHeight / 2,
                boxHeight / 2,
                boxThickness / 2
            ));
            let rigidBody = createAmmoRigidBody(panelShape, panelMesh, 0, 0.5, panelMesh.position, 0); 
    
            panelMesh.userData.physicsBody = rigidBody;
            phy.ammoPhysicsWorld.addRigidBody(rigidBody);
    
            addMeshToScene(panelMesh);
            phy.rigidBodies.push(panelMesh);
        }
    }

    createHingedBoxBottom(x, y, z) {
        const mass = 0;
        const boxHeight = BOX_HEIGHT;
        const boxBottomThickness = 0.01;
        x -= boxHeight / 2; // Adjust for the center of the box
    
        const bottomGeometry = new THREE.BoxGeometry(boxHeight, boxHeight, boxBottomThickness);
        const bottomMesh = createTexturedMesh(bottomGeometry, '../../../assets/textures/bricks2.jpg');
        bottomMesh.rotation.set(-Math.PI / 2, 0, 0);
        bottomMesh.castShadow = true;
        bottomMesh.receiveShadow = true;
        bottomMesh.name = 'box_bottom';
    
        const bottomGroup = new THREE.Group();

        // Create a pivot object
        const pivot = new THREE.Object3D();

        pivot.position.set(0, boxHeight , 0);
        bottomGroup.add(pivot);
        pivot.add(bottomMesh);
        bottomMesh.position.set(0, - boxHeight / 2, 0);
        bottomGroup.position.set(x, y - boxHeight, z);

        // AMMO
        const bottomShape = new Ammo.btBoxShape(new Ammo.btVector3(boxHeight / 2, boxHeight / 2, boxBottomThickness / 2));
        bottomShape.setMargin( 0.05 );
        const bottomBody = createAmmoRigidBody(bottomShape, bottomGroup, 0.7, 0.5, bottomGroup.position, mass);
    
        bottomMesh.userData.physicsBody = bottomBody;

        phy.ammoPhysicsWorld.addRigidBody(
            bottomBody,         
            COLLISION_GROUP_MOVEABLE,
            COLLISION_GROUP_BOX |
                COLLISION_GROUP_SPHERE |
                COLLISION_GROUP_MOVEABLE |
                COLLISION_GROUP_PLANE |
                COLLISION_GROUP_SPRING
        );

        addMeshToScene(bottomGroup);
        phy.rigidBodies.push(bottomGroup);
    
        bottomGroup.threeMesh = bottomMesh;
    
        return bottomGroup;
    }


    createButton(x, y, z) {
        const buttonRadius = BOX_HEIGHT / 4;
        const buttonHeight = BOX_HEIGHT / 4;

        const buttonGeometry = new THREE.CylinderGeometry(buttonRadius, buttonRadius, buttonHeight, 32);
        const buttonMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 }); // Red color
        const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
        buttonMesh.name = 'button';
        
        // Position the button on top of the box
        buttonMesh.position.set(x - BOX_HEIGHT / 2, y + BOX_HEIGHT / 2, z);
    
        // Add the button to the scene
        addMeshToScene(buttonMesh);
    
        return buttonMesh;
    }

    updatePhysicsBodyRotation(mesh, newRotation) {
        let physicsBody = mesh.userData.physicsBody;
        if (!physicsBody) return;
    
        let transform = new Ammo.btTransform();
        physicsBody.getMotionState().getWorldTransform(transform);
    
        let quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(newRotation);
            
        transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
        physicsBody.getMotionState().setWorldTransform(transform);
        physicsBody.activate(true);
    }
    

    pushButton() {
        // Move the button down
        this.button.position.y -= 3;

        this.openBox();
    
        // Use a timeout to move it back up
        setTimeout(() => {
            this.button.position.y += 3; // Move back up
        }, 200);
    }
    

    openBox() {
        if (!this.isOpen) {

            const currentRotation = this.bottom.rotation; // rotation of the group
            let tween = new TWEEN.Tween({ r: currentRotation.x })
                .to({ r: currentRotation.x + Math.PI / 2 }, 2000)
                .easing(TWEEN.Easing.Bounce.Out)
                .onUpdate((obj) => {
                    this.bottom.rotation.x = obj.r;
                })
                .start();
    
            this.isOpen = true;
        }
    }
}