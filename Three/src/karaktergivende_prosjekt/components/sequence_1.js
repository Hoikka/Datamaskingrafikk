import * as THREE from 'three';
import { createAmmoRigidBody, phy } from '../utils/myAmmoHelper';
import { addMeshToScene, createTexturedMesh } from '../utils/myThreeHelper';
import { WALL_HEIGHT, FLOOR_ROOF_SIZE } from '../script';
import * as TWEEN from '@tweenjs/tween.js'   // HUSK: npm install @tweenjs/tween.js
import {
	COLLISION_GROUP_BOX, COLLISION_GROUP_HINGE_SPHERE,
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
        //this.createHinge(wallCenterX, wallCenterY, 0);
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

    
    createHinge(x, y, z) {
        //console.log('createHinge');
        const anchor = this.createAnchor(x, y, z);
        const boxBottom = this.bottom;
        const armLength = anchor.threeMesh.geometry.parameters.width;
        //console.log("Before hinge setup - Bottom position:", boxBottom.position);
        //console.log("Before hinge setup - Anchor position:", anchor.position);

        //AMMO, hengsel: SE F.EKS: https://www.panda3d.org/manual/?title=Bullet_Constraints#Hinge_Constraint:
        const anchorPivot = new Ammo.btVector3( 0, 0.5, 0 );
        const anchorAxis = new Ammo.btVector3(0,1,0);
        const armPivot = new Ammo.btVector3( - armLength/2, 0, 0 );
        const armAxis = new Ammo.btVector3(0,1,0);
        this.hingeConstraint = new Ammo.btHingeConstraint(
            anchor,
            boxBottom,
            anchorPivot,
            armPivot,
            anchorAxis,
            armAxis,
            false
        );

        const lowerLimit = -Math.PI/2;
        const upperLimit = Math.PI/2;
        const softness = 0.9;
        const biasFactor = 0.3;
        const relaxationFactor = 1.0;
        //hingeConstraint.setLimit( lowerLimit, upperLimit, softness, biasFactor, relaxationFactor);
        //hingeConstraint.enableAngularMotor(true, 0, 0.5);
        this.hingeConstraint.setLimit(-Math.PI / 2, Math.PI / 2);
        phy.ammoPhysicsWorld.addConstraint( this.hingeConstraint, false );
        //console.log("After hinge setup - Bottom position:", boxBottom.position);
        //console.log("After hinge setup - Anchor position:", anchor.position);
    }

    createHingedBoxBottom(x, y, z) {
        //console.log('createHingedBoxBottom');
        const mass = 10;
        const boxHeight = BOX_HEIGHT;
        const boxBottomThickness = 0.01;
        x -= boxHeight / 2; // Adjust for the center of the box
    
        const bottomGeometry = new THREE.BoxGeometry(boxHeight, boxHeight, boxBottomThickness);
        const bottomMesh = createTexturedMesh(bottomGeometry, '../../../assets/textures/bricks2.jpg');
        bottomMesh.position.set(x, y - boxHeight / 2, z);
        bottomMesh.rotation.set(-Math.PI / 2, 0, 0);
        bottomMesh.castShadow = true;
        bottomMesh.receiveShadow = true;
        bottomMesh.name = 'box_bottom';
        //const direction = new THREE.Vector3();
        //bottomMesh.getWorldDirection(direction);
    
        // AMMO
        const bottomShape = new Ammo.btBoxShape(new Ammo.btVector3(boxHeight / 2, boxBottomThickness / 2, boxHeight / 2));
        bottomShape.setMargin( 0.05 );
        const bottomBody = createAmmoRigidBody(bottomShape, bottomMesh, 0.7, 0.5, bottomMesh.position, mass);
        bottomBody.setDamping(0.1, 0.5);
	    bottomBody.setActivationState(4);
    
        bottomMesh.userData.physicsBody = bottomBody;
        phy.ammoPhysicsWorld.addRigidBody(
            bottomBody,
            COLLISION_GROUP_BOX,
            COLLISION_GROUP_BOX |
                COLLISION_GROUP_SPHERE |
                COLLISION_GROUP_MOVEABLE |
                COLLISION_GROUP_PLANE |
                COLLISION_GROUP_SPRING
        );

        addMeshToScene(bottomMesh);
        phy.rigidBodies.push(bottomMesh);
        bottomBody.threeMesh = bottomMesh;
    
        return bottomMesh;
    }

    createAnchor(x, y, z, color=0xb846db) {
        //console.log('createAnchor');
        const radius = 1;
        const mass = 0;
        const boxHeight = BOX_HEIGHT;
        x -= boxHeight / 2; // Adjust for the center of the box
    
        //THREE
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 32),
            new THREE.MeshStandardMaterial({color: color, transparent: true, opacity: 0.5}));
        mesh.name = 'hinge_anchor';
        mesh.position.set(x, y - boxHeight / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.collisionResponse = (mesh1) => {
            mesh1.material.color.setHex(Math.random() * 0xffffff);
        };
        //AMMO
        const shape = new Ammo.btSphereShape(mesh.geometry.parameters.radius);
        shape.setMargin( 0.05 );
        const rigidBody = createAmmoRigidBody(shape, mesh, 0.4, 0.6, mesh.position, mass);
        mesh.userData.physicsBody = rigidBody;
        phy.ammoPhysicsWorld.addRigidBody(
            rigidBody,
            COLLISION_GROUP_HINGE_SPHERE,
            COLLISION_GROUP_SPHERE | 
            COLLISION_GROUP_BOX | 
            COLLISION_GROUP_MOVEABLE | 
            COLLISION_GROUP_PLANE );
        phy.rigidBodies.push(mesh);
        rigidBody.threeMesh = mesh;
    
        addMeshToScene(mesh);
        phy.rigidBodies.push(mesh);
        rigidBody.threeMesh = mesh;
    
        return rigidBody;
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
        let transform = new Ammo.btTransform();
        physicsBody.getMotionState().getWorldTransform(transform);
    
        let quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(newRotation.x, newRotation.y, newRotation.z));
        
        transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
        physicsBody.getMotionState().setWorldTransform(transform);
    }

    pushButton() {
        // Move the button down
        this.button.position.y -= 3;

        this.openBox(this.bottom);
    
        // Use a timeout to move it back up
        setTimeout(() => {
            this.button.position.y += 3; // Move back up
        }, 200); // Adjust time as needed
    }
    

    openBox(mesh) {

        if (!mesh.userData.physicsBody)
		    return;

        const rigidBody = mesh.userData.physicsBody;
        rigidBody.activate(true);

        // Adjust the limits of the hinge to allow the box to swing open
        const newLowerLimit = -Math.PI / 2;  // or other appropriate value
        const newUpperLimit = Math.PI / 2;   // or other appropriate value
        this.hingeConstraint.setLimit(newLowerLimit, newUpperLimit);

        // Optionally, apply a small impulse to start the motion
        // The direction and magnitude of the impulse might need to be adjusted based on your setup
        const impulseMagnitude = 10;  // Adjust as needed
        const impulseDirection = new Ammo.btVector3(0, -impulseMagnitude, 0); // Downward impulse
        const impulseLocation = new Ammo.btVector3(0, 0, 0); // Apply at the center of the bottom

        rigidBody.applyImpulse(impulseDirection, impulseLocation);
        }

        //if (this.isOpen){

        //} else {
        //    console.log(this.bottom.rotation.x);
        //    let tween = new TWEEN.Tween({r: 0})
        //        .to([{r: -90}], 2000)
        //        .easing(TWEEN.Easing.Bounce.Out)
        //        .yoyo(true)
        //        .onUpdate((obj) => {
        //            console.log(this.bottom.rotation.x);
        //            this.bottom.rotation.x = obj.r * Math.PI / 180;
        //            updatePhysicsBodyRotation(this.bottom, new THREE.Vector3(newRotation, 0, 0));
        //        });
        //    tween.start();

        //    this.isOpen = true;
        //}
    //}
}