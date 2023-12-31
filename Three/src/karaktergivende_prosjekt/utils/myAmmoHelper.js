import * as THREE from "three";

export const COLLISION_GROUP_PLANE = 1;
export const COLLISION_GROUP_SPHERE = 2;
export const COLLISION_GROUP_MOVEABLE = 4;
export const COLLISION_GROUP_BOX = 8;
export const COLLISION_GROUP_HINGE_SPHERE = 16;
export const COLLISION_GROUP_SPRING = 32;
export const COLLISION_GROUP_P2P = 64;


export const phy = {
	ammoPhysicsWorld: undefined,
	rigidBodies: [],
	checkCollisions: true,
	transform: undefined
};

export function createAmmoWorld(checkCollisions= true) {
	phy.checkCollisions = checkCollisions;

	phy.transform = new Ammo.btTransform(); // Hjelpeobjekt.

	// Initialiserer phy.ammoPhysicsWorld:
	let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
		dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
		overlappingPairCache = new Ammo.btDbvtBroadphase(),
		solver = new Ammo.btSequentialImpulseConstraintSolver();

	phy.ammoPhysicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
	phy.ammoPhysicsWorld.setGravity(new Ammo.btVector3(0, -9.80665, 0));
}

export function createAmmoRigidBody(shape, threeMesh, restitution=0.7, friction=0.8, position={x:0, y:50, z:0}, mass=1) {

	let transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

	let quaternion = threeMesh.quaternion;
	transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

	let scale = threeMesh.scale;
	shape.setLocalScaling(new Ammo.btVector3(scale.x, scale.y, scale.z));

	let motionState = new Ammo.btDefaultMotionState(transform);
	let localInertia = new Ammo.btVector3(0, 0, 0);
	shape.calculateLocalInertia(mass, localInertia);

	let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
	let rigidBody = new Ammo.btRigidBody(rbInfo);
	rigidBody.setRestitution(restitution);
	rigidBody.setFriction(friction);

	return rigidBody;
}

export function updatePhysics(deltaTime) {
    // Step physics world:
    phy.ammoPhysicsWorld.stepSimulation(deltaTime, 10);

    // Update rigid bodies
    for (let i = 0; i < phy.rigidBodies.length; i++) {
        let obj = phy.rigidBodies[i];

        // If the object is a group, update each child
        if (obj instanceof THREE.Group) {
            obj.children.forEach(child => {
                updateMeshPhysics(child);
            });
        } else {
            // If it's not a group, update normally
            updateMeshPhysics(obj);
        }
    }
}

function updateMeshPhysics(mesh) {
    let rigidBody = mesh.userData.physicsBody;
    let motionState = rigidBody ? rigidBody.getMotionState() : null;
    if (motionState) {
        motionState.getWorldTransform(phy.transform);
        let p = phy.transform.getOrigin();
        let q = phy.transform.getRotation();
        mesh.position.set(p.x(), p.y(), p.z());
        mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
    }
}

export function moveRigidBody(movableMesh, direction) {
	let transform = new Ammo.btTransform();
	let motionState = movableMesh.userData.physicsBody.getMotionState();
	motionState.getWorldTransform(transform);
	let position = transform.getOrigin();
	transform.setOrigin(new Ammo.btVector3(position.x() + direction.x, position.y() + direction.y, position.z() + direction.z));
	motionState.setWorldTransform(transform);
}

export function applyImpulse(rigidBody, force=IMPULSE_FORCE, direction = {x:0, y:1, z:0}) {
	if (!rigidBody)
		return;
	rigidBody.activate(true);
	let impulseVector = new Ammo.btVector3(direction.x * force , direction.y * force , direction.z * force );
	rigidBody.applyCentralImpulse(impulseVector);
}
