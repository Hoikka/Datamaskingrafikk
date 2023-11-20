import * as THREE from 'three';
import { createAmmoRigidBody, phy } from '../utils/myAmmoHelper';
import { addMeshToScene, createTexturedMesh } from '../utils/myThreeHelper';
import { WALL_HEIGHT, FLOOR_ROOF_SIZE } from '../script';


const BOX_HEIGHT = 50;

export class StartBox {
    constructor() {
        this.isOpen = false;

        const wallCenterX = FLOOR_ROOF_SIZE / 2;
        const wallCenterY = WALL_HEIGHT / 2;

        this.createBox(wallCenterX, wallCenterY, 0);
        this.createHingedBoxBottom(wallCenterX, wallCenterY, 0);
        this.button = this.createButton(wallCenterX, wallCenterY, 0);

    }

    createHinge() {
        const anchor = createAnchor();
        const boxBottom = createHingedBoxBottom();
        const armLength = box.threeMesh.geometry.parameters.width;

        //AMMO, hengsel: SE F.EKS: https://www.panda3d.org/manual/?title=Bullet_Constraints#Hinge_Constraint:
        const anchorPivot = new Ammo.btVector3( 0, 0.5, 0 );
        const anchorAxis = new Ammo.btVector3(0,1,0);
        const armPivot = new Ammo.btVector3( - armLength/2, 0, 0 );
        const armAxis = new Ammo.btVector3(0,1,0);
        const hingeConstraint = new Ammo.btHingeConstraint(
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
        hingeConstraint.setLimit( lowerLimit, upperLimit, softness, biasFactor, relaxationFactor);
        hingeConstraint.enableAngularMotor(true, 0, 0.5);
        phy.ammoPhysicsWorld.addConstraint( hingeConstraint, false );
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
        const mass = 10;
        const boxWidth = BOX_HEIGHT;
        const boxBottomThickness = 0.01;
    
        const bottomGeometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxBottomThickness);
        const bottomMesh = createTexturedMesh(bottomGeometry, '../../../assets/textures/bricks2.jpg');
        bottomMesh.position.set(x, y - boxWidth / 2, z);
        bottomMesh.rotation.set(-Math.PI / 2, 0, 0);
        bottomMesh.castShadow = true;
        bottomMesh.receiveShadow = true;
        const direction = new THREE.Vector3();
        bottomMesh.getWorldDirection(direction);
    
        // AMMO
        const bottomShape = new Ammo.btBoxShape(new Ammo.btVector3(boxWidth / 2, boxBottomThickness / 2, boxWidth / 2));
        const bottomBody = createAmmoRigidBody(bottomShape, bottomMesh, 0.7, 0.5, bottomMesh.position, mass);
    
        bottomMesh.userData.physicsBody = bottomBody;
        phy.ammoPhysicsWorld.addRigidBody(bottomBody);
    
        // Create hinge constraint between the bottom and the box
        // ... (use the correct rigid bodies and adjust the pivot points and axes)
    
        // Add the bottom panel to the scene
        addMeshToScene(bottomMesh);
        phy.rigidBodies.push(bottomMesh);
    
        return bottomMesh;
    }

    createAnchor(color=0xb846db) {
        const radius = 1;
        const position={x:0, y:0, z:0};
        const mass = 0;
    
        //THREE
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 32),
            new THREE.MeshStandardMaterial({color: color, transparent: true, opacity: 0.5}));
        mesh.name = 'hinge_anchor';
        mesh.position.set(position.x, position.y, position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.collisionResponse = (mesh1) => {
            mesh1.material.color.setHex(Math.random() * 0xffffff);
        };
        //AMMO
        const shape = new Ammo.btSphereShape(mesh.geometry.parameters.radius);
        shape.setMargin( 0.05 );
        const rigidBody = createAmmoRigidBody(shape, mesh, 0.4, 0.6, position, mass);
        mesh.userData.physicsBody = rigidBody;
        phy.ammoPhysicsWorld.addRigidBody(
            rigidBody,
            COLLISION_GROUP_HINGE_SPHERE,
            COLLISION_GROUP_SPHERE | COLLISION_GROUP_BOX | COLLISION_GROUP_MOVEABLE | COLLISION_GROUP_PLANE );
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

    pushButton() {
        // Move the button down
        new THREE.Vector3(0, -0.1, 0);

        // You can use a simple timeout to move it back up
        setTimeout(() => {
            this.button.position.y += 0.1; // Move back up
        }, 200); // Adjust time as needed
    }
    

    openBox() {
        if (this.isOpen){

        } else {

            this.isOpen = true;
        }
    }
}