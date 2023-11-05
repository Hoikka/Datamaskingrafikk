import * as THREE from "three";


export class Claw extends THREE.Group {
    constructor(textureObject) {
        super();
        this.textureObject = null;
        
        this.clawRotation = 0.0;
        this.clawOpenClose = 0.0;
        this.currentlyPressedKeys = [];
    }
    
    loadTexture(callback) {
        const loader = new THREE.TextureLoader();
        loader.load(
            '../../../assets/textures/metal.jpg',
            (textureObject) => {
                this.textureObject = textureObject;
                this._createClawMesh(textureObject);
                callback(this);
            },
            undefined,
            (error) => {
                console.error("An error occurred while loading the texture.", error);
            }
        );
    }

    _createClawMesh(textureObject) {
        // Materials
        let material = new THREE.MeshStandardMaterial({map: textureObject, wireframe: true});

        // Base
        let baseGeometry = new THREE.CylinderGeometry(5, 5, 1, 20, 5, false);
        this.base = new THREE.Mesh(baseGeometry, material);
        this.base.name = 'base';
        this.add(this.base);

        // Fingers - assuming 3 fingers as mentioned
        this._createFinger(new THREE.Vector3(-5, 0, -2), 45, material, 'Left'); // Left finger
        this._createFinger(new THREE.Vector3(0, 0, 2), -45, material, 'Middle');   // Middle finger
        this._createFinger(new THREE.Vector3(5, 0, -2), 45, material, 'Right');  // Right finger

    }

    _createFinger(position, angle, material, fingerName) {
        // Base cylinder of the finger
        let baseFingerGeometry = new THREE.CylinderGeometry(2, 2, 10, 32);
        baseFingerGeometry.translate(0, 5, 0);
        let baseFinger = new THREE.Mesh(baseFingerGeometry, material);
        baseFinger.name = `${fingerName}Base`;
        baseFinger.position.copy(position);
        baseFinger.rotation.x = THREE.MathUtils.degToRad(angle + 180);
        this.add(baseFinger);
        
        // Move the origin of the geometry to the bottom of the cylinder
        let finger1Geometry = new THREE.CylinderGeometry(1.5, 1.5, 8, 32);
        finger1Geometry.translate(0, 4, 0);
        let finger1 = new THREE.Mesh(finger1Geometry, material);
        finger1.name = `${fingerName}Finger1`;
        finger1.position.y = 10;
        baseFinger.add(finger1);
        
        // Move the origin of the geometry to the bottom of the cylinder
        let finger2Geometry = new THREE.CylinderGeometry(1, 1, 6, 32);
        finger2Geometry.translate(0, 3, 0);
        let finger2 = new THREE.Mesh(finger2Geometry, material);
        finger2.name = `${fingerName}Finger2`;
        finger2.position.y = 8;
        finger1.add(finger2);
    }
    

    animate(deltaTime) {
        // Ensure that the claw's rotation does not exceed its limits.
        this.clawOpenClose = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, this.clawOpenClose));
    
        // Update the claw's rotation based on the `clawOpenClose` property.
        let leftFingerHinge1 = this.getObjectByName("LeftFinger1");
        let leftFingerHinge2 = this.getObjectByName("LeftFinger2");
    
        let middleFingerHinge1 = this.getObjectByName("MiddleFinger1");
        let middleFingerHinge2 = this.getObjectByName("MiddleFinger2");
    
        let rightFingerHinge1 = this.getObjectByName("RightFinger1");
        let rightFingerHinge2 = this.getObjectByName("RightFinger2");
    
        if (leftFingerHinge1 && leftFingerHinge2 && middleFingerHinge1 && middleFingerHinge2 && rightFingerHinge1 && rightFingerHinge2) {
            leftFingerHinge1.rotation.x = -this.clawOpenClose;
            leftFingerHinge2.rotation.x = -this.clawOpenClose;
    
            middleFingerHinge1.rotation.x = this.clawOpenClose * 2; // This rotates the bottom finger to "fit" between the two top fingers.
            middleFingerHinge2.rotation.x = this.clawOpenClose * 2;
    
            rightFingerHinge1.rotation.x = -this.clawOpenClose;
            rightFingerHinge2.rotation.x = -this.clawOpenClose;
        }

        let base = this.getObjectByName("base");
        if (base) {
            //console.log('Base rotation:', this.base.rotation);

            //console.log('Finger parent:', this.getObjectByName("LeftFinger1").parent);

            base.rotation.y = this.clawRotation;
        }
    }
    
    handleKeys(delta) {
        const CLAW_SPEED = Math.PI;
        const ROTATION_SPEED = Math.PI;
    
        // Check for the modifiers:
        let shiftPressed = this.currentlyPressedKeys['ShiftLeft'] || this.currentlyPressedKeys['ShiftRight'];
    
        // Open/close claw:
        if (!shiftPressed) { // Only allow open/close when Shift isn't pressed.
            if (this.currentlyPressedKeys['KeyZ']) {
                this.clawOpenClose = Math.max(this.clawOpenClose - (CLAW_SPEED * delta), -Math.PI / 4);
            }
            if (this.currentlyPressedKeys['KeyX']) {
                this.clawOpenClose = Math.min(this.clawOpenClose + (CLAW_SPEED * delta), Math.PI / 4);
            }

        } else { // If Shift is pressed, then handle the rotation.
            if (this.currentlyPressedKeys['KeyZ']) {
                this.clawRotation -= ROTATION_SPEED * delta;
            }
            if (this.currentlyPressedKeys['KeyX']) {
                this.clawRotation += ROTATION_SPEED * delta;
            }
        }
    }
}
