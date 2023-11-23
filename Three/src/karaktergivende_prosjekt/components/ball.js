import * as THREE from "three";
import { addMeshToScene} from '../utils/myThreeHelper';
import { createAmmoRigidBody, phy } from '../utils/myAmmoHelper';
import { WALL_HEIGHT, FLOOR_ROOF_SIZE } from '../script';
import { BOX_HEIGHT } from './sequence_1.js';


export class Ball {
    constructor(radius = 10, color = 0xff0000) {

        var x = FLOOR_ROOF_SIZE/2 - BOX_HEIGHT /2;
        var y = WALL_HEIGHT / 2;
        var z = 0

        var position = {x: x, y: y, z: z};
        this.createBall(radius, color, position);

    }

    createBall(radius, color=0x00FF00, position={x:0, y:50, z:0}) {
        const mass = 100;

        //THREE
        let mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 32),
            new THREE.MeshStandardMaterial({color: color}));
        mesh.name = 'sphere';
        mesh.position.set(position.x, position.y, position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.collisionResponse = (mesh1) => {
            mesh1.material.color.setHex(Math.random() * 0xffffff);
        };
        //AMMO
        let shape = new Ammo.btSphereShape(mesh.geometry.parameters.radius);
        shape.setMargin( 0.05 );
        let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.5, position, mass);
    
        mesh.userData.physicsBody = rigidBody;
    
        // Legger til physics world:
        phy.ammoPhysicsWorld.addRigidBody(rigidBody);
    
        addMeshToScene(mesh);
        phy.rigidBodies.push(mesh);
        rigidBody.threeMesh = mesh;
    }

    setPosition(x, y, z) {
        this.ballMesh.position.set(x, y, z);
    }
}