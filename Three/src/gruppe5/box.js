// Box.js
import * as THREE from "three";

export class Box {
    constructor() {
        this.geometry = new THREE.BoxGeometry(10, 10, 10);
        this.material = new THREE.MeshBasicMaterial({color: 0xffff00});
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    // Other methods related to Box's functionality.
}
