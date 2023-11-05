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
        let baseMaterial = new THREE.MeshPhongMaterial({map: textureObject, wireframe: true});
        let fingerMaterial = new THREE.MeshPhongMaterial({map: textureObject, wireframe: true});

        // Base
        let baseGeometry = new THREE.CylinderGeometry(2, 2, 15, 20, 5, false);
        this.base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.add(this.base);

        // Fingers - assuming 3 fingers as mentioned
        this._createFinger(new THREE.Vector3(-15, 0, 0), fingerMaterial); // Left finger
        this._createFinger(new THREE.Vector3(0, 0, 0), fingerMaterial);   // Middle finger
        this._createFinger(new THREE.Vector3(15, 0, 0), fingerMaterial);  // Right finger
    }

    _createFinger(position, material) {
        // Base cylinder of the finger
        let baseFingerGeometry = new THREE.CylinderGeometry(2, 2, 10, 32);
        let baseFinger = new THREE.Mesh(baseFingerGeometry, material);
        baseFinger.position.copy(position);
        this.add(baseFinger);
        
        // 1st hinged cylinder - you can adjust the position and size as needed
        let hinge1Geometry = new THREE.CylinderGeometry(1.5, 1.5, 8, 32);
        let hinge1 = new THREE.Mesh(hinge1Geometry, material);
        hinge1.position.y = position.y + 10; 
        baseFinger.add(hinge1);

        // 2nd hinged cylinder - adjust position and size as needed
        let hinge2Geometry = new THREE.CylinderGeometry(1, 1, 6, 32);
        let hinge2 = new THREE.Mesh(hinge2Geometry, material);
        hinge2.position.y = position.y + 18;
        hinge1.add(hinge2);
    }

    rotateClaw(angle) {
        this.base.rotation.y += angle;
    }

    closeFingers() {
        // Rotate fingers to simulate closing
        this.leftFinger1.rotation.z += SOME_ANGLE;
        this.leftFinger2.rotation.z -= SOME_ANGLE;
        this.rightFinger.rotation.z += SOME_ANGLE;
    }

    openFingers() {
        // Rotate fingers to simulate opening
        this.leftFinger1.rotation.z -= SOME_ANGLE;
        this.leftFinger2.rotation.z += SOME_ANGLE;
        this.rightFinger.rotation.z -= SOME_ANGLE;
    }

    animate(deltaTime) {
        // Ensure that the claw's rotation does not exceed its limits.
        this.clawOpenClose = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, this.clawOpenClose));
    
        // Update the claw's rotation based on the `clawOpenClose` property.
        let leftFingerHinge1 = this.getObjectByName("leftFingerHinge1");
        let leftFingerHinge2 = this.getObjectByName("leftFingerHinge2");
    
        let middleFingerHinge1 = this.getObjectByName("middleFingerHinge1");
        let middleFingerHinge2 = this.getObjectByName("middleFingerHinge2");
    
        let rightFingerHinge1 = this.getObjectByName("rightFingerHinge1");
        let rightFingerHinge2 = this.getObjectByName("rightFingerHinge2");
    
        if (leftFingerHinge1 && leftFingerHinge2 && middleFingerHinge1 && middleFingerHinge2 && rightFingerHinge1 && rightFingerHinge2) {
            leftFingerHinge1.rotation.z = -this.clawOpenClose;
            leftFingerHinge2.rotation.z = -this.clawOpenClose;
    
            middleFingerHinge1.rotation.z = this.clawOpenClose * 2; // This rotates the bottom finger to "fit" between the two top fingers.
            middleFingerHinge2.rotation.z = this.clawOpenClose * 2;
    
            rightFingerHinge1.rotation.z = this.clawOpenClose;
            rightFingerHinge2.rotation.z = this.clawOpenClose;
        }
    }
    
    handleKeys(delta) {
        const CLAW_SPEED = 10.0;
        const ROTATION_SPEED = Math.PI / 180 * 10;  // For example, 10 degrees per second.
    
        // Check for the modifiers:
        let shiftPressed = this.currentlyPressedKeys['ShiftLeft'] || this.currentlyPressedKeys['ShiftRight'];
    
        // Open/close claw:
        if (!shiftPressed) { // Only allow open/close when Shift isn't pressed.
            if (this.currentlyPressedKeys['KeyZ']) {
                this.claw = this.claw - (CLAW_SPEED * delta);
            }
            if (this.currentlyPressedKeys['KeyX']) {
                this.claw = this.claw + (CLAW_SPEED * delta);
            }
        } else { // If Shift is pressed, then handle the rotation.
            if (this.currentlyPressedKeys['KeyZ']) {
                this.rotation -= (ROTATION_SPEED * delta);  // Rotate the claw counter-clockwise
            }
            if (this.currentlyPressedKeys['KeyX']) {
                this.rotation += (ROTATION_SPEED * delta);  // Rotate the claw clockwise
            }
        }
    }
    
}
