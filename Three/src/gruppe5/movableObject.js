// movableObject.js
import * as THREE from "three";

class MovableObject extends THREE.Mesh {
    constructor(geometry, material) {
        super(geometry, material);
        this.isMovable = true;
    }

    // Add methods for movement here
}

export class Box {
    constructor() {
        this.geometry = new THREE.BoxGeometry(10, 50, 10);
        this.material = new THREE.MeshBasicMaterial({color: 0xffff00});
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    // Other methods related to Box's functionality.
}


class Cylinder extends MovableObject {
    constructor() {
        super(new THREE.CylinderGeometry(), new THREE.MeshBasicMaterial({color: 0xff0000}));
    }
}