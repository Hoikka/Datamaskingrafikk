// movableObject.js
import * as THREE from "three";

class MovableObject extends THREE.Mesh {
    constructor(geometry, material) {
        super(geometry, material);
        this.isMovable = true;
    }

    move(x, y, z) {
        this.position.set(x, y, z);
    }
}

export class Box extends MovableObject {
    constructor() {
        const geometry = new THREE.BoxGeometry(10, 50, 10);
        const material = new THREE.MeshBasicMaterial({color: 0xffff00});
        super(geometry, material);
    }
}

export class Cylinder extends MovableObject {
    constructor(radiusTop = 5, radiusBottom = 5, height = 10) {
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height);
        const material = new THREE.MeshBasicMaterial({color: 0xff0000});
        super(geometry, material);
    }
}