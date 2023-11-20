import * as THREE from "three";
import { createAmmoRigidBody } from "./myAmmoHelper.js";
import { addMeshToScene, phy } from "./myThreeHelper.js";

export class Ball {
    constructor(radius = 1, color = 0xff0000) {
        // THREE.js
        const ballGeometry = new THREE.SphereGeometry(radius, 32, 32);
        const ballMaterial = new THREE.MeshStandardMaterial({ color: color });
        this.ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ballMesh.castShadow = true;

        // AMMO.js
        const ballShape = new createAmmoRigidBody.btSphereShaoe(radius);
        const ballMass = 1;
        this.rigidBody = createAmmoRigidBody(ballShape, this.ballMesh, 0,4, 0,6, this.ballMesh.position, ballMass);
        this.ballMesh.userData.physicsBody = this.rigidBody;

        // Add to scene
        addMeshToScene(this.ballMesh);
        phy.rigidBody.push(this.ballMesh);
        phy.ammoPhysicsWorld.addRigidBody(this.rigidBody);
    }

    setPosition(x, y, z) {
        this.ballMesh.position.set(x, y, z);
    }
}