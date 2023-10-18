import * as THREE from "three";
import {commons} from "./lib/Common.js";

export class MySphere {
	constructor(myAmmoPhysicsWorld) {
		this.myAmmoPhysicsWorld = myAmmoPhysicsWorld;
	}

	create(setCollisionMask=true, position={x:0, y:50, z:0}, color=0x00FF00, mass=10) {
		let radius = 0.2*mass;

		//THREE
		let mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), new THREE.MeshPhongMaterial({color: color}));
		mesh.userData.tag = 'sphere';
		mesh.position.set(position.x, position.y, position.z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		// Implementer denne ved behov. Kalles fra MyPhysicsWorld ved kollisjon.
		mesh.collisionResponse = (mesh1) => {
			mesh1.material.color.setHex(Math.random() * 0xffffff);
		};

		//AMMO
		let shape = commons.createSphereShape(mesh);
		let rigidBody = commons.createAmmoRigidBody(shape, mesh, 0.7, 0.8, position, mass);

		// Legger til physics world:
		this.myAmmoPhysicsWorld.addPhysicsObject(
			rigidBody,
			mesh,
			setCollisionMask,
			this.myAmmoPhysicsWorld.COLLISION_GROUP_SPHERE,
			this.myAmmoPhysicsWorld.COLLISION_GROUP_SPHERE |
				this.myAmmoPhysicsWorld.COLLISION_GROUP_PLANE |
				this.myAmmoPhysicsWorld.COLLISION_GROUP_COMPOUND |
				this.myAmmoPhysicsWorld.COLLISION_GROUP_CONVEX |
				this.myAmmoPhysicsWorld.COLLISION_GROUP_MOVEABLE |
				this.myAmmoPhysicsWorld.COLLISION_GROUP_TRIANGLE |
				this.myAmmoPhysicsWorld.COLLISION_GROUP_BOX |
				this.myAmmoPhysicsWorld.COLLISION_GROUP_HINGE_SPHERE
		);
	}

	createRandom(setCollisionMask=true, xzrange=200, height=50) {
		let xPos = -(xzrange/2) + Math.random() * xzrange;
		let zPos = -(xzrange/2) + Math.random() * xzrange;
		let pos = {x: xPos, y: height, z: zPos};
		let mass = 2 + Math.random() * 20;
		this.create(setCollisionMask, pos, 0xff0505, mass);
	}
}
