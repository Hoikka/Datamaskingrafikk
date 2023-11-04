// Ground.js
import * as THREE from "three";

export class Ground {
    constructor(width, height, depth) {
        this.geometry = new THREE.BoxGeometry(width, height, depth);
        this.material = new THREE.MeshStandardMaterial({side: THREE.DoubleSide, wireframe: false});
        this.mesh = new THREE.Mesh(this.geometry,this.material);
        

        // Set the position so that the top of the box is at y = 0 (like it's "sitting" on the ground)
        this.mesh.position.y = -height / 2;
    }

    // Other methods related to Ground's functionality.
}
