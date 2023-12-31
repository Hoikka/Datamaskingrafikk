import * as THREE from "three";


export class Arm extends THREE.Group {
    constructor(textureObject) {
        super();
        this.textureObject = null;
        this.cameraPosition = new THREE.Group();
        this.arm = this._createArmMesh(textureObject);
        this.add(this.arm);

        // Rotasjon og kontroll
        this.extension = 0.0;
        this.baseRotation = 0.0;
        this.joint1Rotation = 10.0;
        this.joint2Rotation = -5.0;
        this.baseJointRotation = 1.0;

        this.currentlyPressedKeys = [];
    }

    loadTexture(callback) {
        const loader = new THREE.TextureLoader();
        loader.load(
            '../../../assets/textures/metal.jpg',
            (textureObject) => {
                this.textureObject = textureObject;
                this.arm = this._createArmMesh(textureObject);
                callback(this.arm);
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the texture.", error);
            }
        );
    }

    _createArmMesh(textureObject) {
        // Container for the whole arm:
        const arm = new THREE.Group();

        let material = new THREE.MeshStandardMaterial({map: textureObject, wireframe: false});

        // Base:
        let gFoot = new THREE.CylinderGeometry(30, 20, 15, 20, 5, false);
        let meshBase = new THREE.Mesh(gFoot, material);
        meshBase.castShadow = true;
        meshBase.name = 'base';
        meshBase.position.x = 0;
        meshBase.position.y = 173;
        meshBase.position.z = 0;
        arm.add(meshBase);

        // Joint between base and first cylinder (LowerArm):
        let gBaseJoint = new THREE.CylinderGeometry(10, 10, 10, 32);
        gBaseJoint.rotateZ(Math.PI/2);
        let meshBaseJoint = new THREE.Mesh(gBaseJoint, material);
        meshBaseJoint.castShadow = true;
        meshBaseJoint.name = 'baseJoint';
        meshBaseJoint.position.x = 0;
        meshBaseJoint.position.y = -12.5;
        meshBaseJoint.position.z = 0;
        meshBaseJoint.rotation.x = Math.PI / 2;
        meshBase.add(meshBaseJoint);

        // LowerArm:
        let gLowerArm = new THREE.CylinderGeometry(4, 4, 80, 8, 1, false);
        let meshLowerArm = new THREE.Mesh(gLowerArm, material);
        meshLowerArm.castShadow = true;
        meshLowerArm.name = 'LowerArm';
        meshLowerArm.position.x = 0;
        meshLowerArm.position.y = -40;
        meshLowerArm.position.z = 0;
        meshBaseJoint.add(meshLowerArm);

        // Joint1:
        let gJoint1 = new THREE.CylinderGeometry(7, 7, 10, 32);
        gJoint1.rotateZ(Math.PI/2);
        let meshJoint1 = new THREE.Mesh(gJoint1, material);
        meshJoint1.castShadow = true;
        meshJoint1.name = 'joint1';
        meshJoint1.position.x = 0;
        meshJoint1.position.y = -45;
        meshJoint1.position.z = 0;
        meshLowerArm.add(meshJoint1);

        // arm1:
        let gMidArm = new THREE.CylinderGeometry(4, 4, 80, 8, 1, false);
        let meshMidArm = new THREE.Mesh(gMidArm, material);
        meshMidArm.castShadow = true;
        meshMidArm.name = 'MidArm';
        meshMidArm.position.x = 0;
        meshMidArm.position.y = -40;
        meshMidArm.position.z = 0;
        meshJoint1.add(meshMidArm);

        // Joint2:
        let gJoint2 = new THREE.CylinderGeometry(7, 7, 10, 32);
        gJoint2.rotateZ(Math.PI/2);
        let meshJoint2 = new THREE.Mesh(gJoint2, material);
        meshJoint2.name = 'joint2';
        meshJoint2.castShadow = true;
        meshJoint2.position.x = 0;
        meshJoint2.position.y = -45;
        meshJoint2.position.z = 0;
        meshMidArm.add(meshJoint2);

        // arm2:
        let gUpperArm = new THREE.CylinderGeometry(4, 4, 80, 8, 1, false);
        let meshUpperArm = new THREE.Mesh(gUpperArm, material);
        meshUpperArm.castShadow = true;
        meshUpperArm.name = 'UpperArm';
        meshUpperArm.position.x = 0;
        meshUpperArm.position.y = -45;
        meshUpperArm.position.z = 0;
        meshJoint2.add(meshUpperArm);

        // Camera position:
        this.cameraPosition.position.set(0, -30, -6);  // Adjust camera position on arm
        meshUpperArm.add(this.cameraPosition);

        // arm2 extension:
        let gExtension = new THREE.CylinderGeometry(3, 3, 80, 8, 1, false);
        let meshExtension = new THREE.Mesh(gExtension, material);
        meshExtension.castShadow = true;
        meshExtension.name = 'ExtensionArm';
        meshExtension.position.x = 0;
        meshExtension.position.y = -60;
        meshExtension.position.z = 0;
        meshUpperArm.add(meshExtension);

        this.meshExtension = meshExtension;
        

        return arm;
    }

    getMeshExtension() {
        return this.meshExtension;
    }

    getCameraPosition() {
        return this.cameraPosition;
    }


    animate(deltaTime) {
        // Handle base rotation:
        let base = this.arm.getObjectByName("base");
        if (base) {
            base.rotation.y = this.baseRotation;
        }

        // Joint rotations:
        let baseJointMesh = this.arm.getObjectByName("baseJoint", true);
        let joint1Mesh = this.arm.getObjectByName("joint1", true);
        let joint2Mesh = this.arm.getObjectByName("joint2", true);

        if (baseJointMesh) {
            baseJointMesh.rotation.x = this.baseJointRotation;
        }
        if (joint1Mesh) {
            joint1Mesh.rotation.x = this.joint1Rotation;
        }
        if (joint2Mesh) {
            joint2Mesh.rotation.x = this.joint2Rotation;
        }

        // Handle arm extension:
        let extensionArm = this.arm.getObjectByName("ExtensionArm", true);
        if (extensionArm) {
            extensionArm.position.y = this.extension;
        }
    }

    handleKeys(delta) {
        const rotationSpeed = Math.PI;
        const EXTENSION_SPEED = 15.0;
    
        // Check for the Shift key:
        const shiftPressed = this.currentlyPressedKeys['ShiftLeft'] || this.currentlyPressedKeys['ShiftRight'];
        
        if (!shiftPressed) {
            // Rotate base:
            if (this.currentlyPressedKeys['KeyA']) {
                this.baseRotation -= rotationSpeed * delta;
            }
            if (this.currentlyPressedKeys['KeyD']) {
                this.baseRotation += rotationSpeed * delta;
            }
            // Rotate base joint:
        if (this.currentlyPressedKeys['KeyS']) {
            //if statements below to limit the rotation(these are limited to 45 degrees each direction)
            if( this.baseJointRotation<(Math.PI/2)){
                this.baseJointRotation += rotationSpeed * delta;}
        }
        if (this.currentlyPressedKeys['KeyW']) {
           if(this.baseJointRotation>(-Math.PI/2)){
                this.baseJointRotation -= rotationSpeed * delta;}
        }
        }
    
        // Extend arm:
        if (this.currentlyPressedKeys['KeyQ'] && this.extension < 0.0) {
            this.extension += EXTENSION_SPEED * delta;
        }
        if (this.currentlyPressedKeys['KeyE'] && this.extension > -80.0) {
            this.extension -= EXTENSION_SPEED * delta;
        }
    
        // Rotate joint 1 & joint 2:
        if (shiftPressed) {
            if (this.currentlyPressedKeys['KeyS']) {
                //if statements to lock rotation (current rotation 180 degree)
                if( this.joint1Rotation<(4*Math.PI)){
                    this.joint1Rotation += rotationSpeed * delta;}
            }
            if (this.currentlyPressedKeys['KeyW']) {
                if(this.joint1Rotation>(3*Math.PI)){
                    this.joint1Rotation -= rotationSpeed * delta;}
            }
            if (this.currentlyPressedKeys['KeyA']) {
                if(this.joint2Rotation>(-5*Math.PI/2)){
                this.joint2Rotation -= rotationSpeed * delta;}
            }
            if (this.currentlyPressedKeys['KeyD']) {
                if( this.joint2Rotation<(-3*Math.PI/2)){
                this.joint2Rotation += rotationSpeed * delta;}
            }
        }
    }
}
