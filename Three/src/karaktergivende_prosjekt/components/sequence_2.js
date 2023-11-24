import * as THREE from "three";
import { createAmmoRigidBody, phy } from '../utils/myAmmoHelper';
import { addMeshToScene, createTexturedMesh } from '../utils/myThreeHelper';
import { createConvexTriangleShapeAddToCompound } from "../utils/triangleMeshHelpers";
import { WALL_HEIGHT, FLOOR_ROOF_SIZE } from '../script';
import {
	COLLISION_GROUP_BOX, COLLISION_GROUP_HINGE_SPHERE,
	COLLISION_GROUP_MOVEABLE,
	COLLISION_GROUP_PLANE,
	COLLISION_GROUP_SPHERE,
	COLLISION_GROUP_SPRING
} from "../utils/myAmmoHelper";
import { add } from "@tweenjs/tween.js";


export class FunnelTubeSystem {
    constructor() {
        const x = FLOOR_ROOF_SIZE / 2 - 50;
        const y = WALL_HEIGHT / 2 - 120;
        const z = 0;

        let position = { x: x, y: y, z: z };

        this.createFunnelSystem(position);
        
    }

    createFunnelSystem(position) {
        let compoundShape = new Ammo.btCompoundShape();

        let groupMesh = new THREE.Group();
        groupMesh.userData.tag = 'funnelSystem';
        groupMesh.position.set(position);

        let material = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

        this.createCurvedSlide(groupMesh, compoundShape, material);
        this.createFunnel(groupMesh, compoundShape, material);

    
        // Sett samme transformasjon på compoundShape som på bottomMesh:
        let rigidBody = createAmmoRigidBody(compoundShape, groupMesh, 0.4, 0.6, position, 0);
        groupMesh.userData.physicsBody = rigidBody;
        // Legger til physics world:
        phy.ammoPhysicsWorld.addRigidBody(rigidBody);

        addMeshToScene(groupMesh);
        phy.rigidBodies.push(groupMesh);
        rigidBody.threeMesh = groupMesh;
    }


    createCurvedSlide(groupMesh, compoundShape, material) {
        // Define points for the curve
        const points = [
            // Start at (0,0,0)
            new THREE.Vector3(0, 0, 0),

            // Transition to slide
            new THREE.Vector3(0, -10, 0),
        
            // Slide points extending downward
            new THREE.Vector3(-10, -20, 0),
            new THREE.Vector3(-30, -30, 0),
            new THREE.Vector3(-40, -35, 0),
        ];
        let curve = new THREE.CatmullRomCurve3(points);
    
        // Tube geometry
        let tubeGeometry = new THREE.TubeGeometry(curve, 20, 10, 8, false);
    
        // Creating the mesh
        let slideMesh = new THREE.Mesh(tubeGeometry, material);
        slideMesh.name = 'slide';
        groupMesh.add(slideMesh);
        createConvexTriangleShapeAddToCompound(compoundShape, slideMesh);
    }
    
    createFunnel(groupMesh, compoundShape, material) {
        const topRadius = 40;
        const bottomRadius = 10;
        const height = 50;
        const segments = 32;

        // Buffers for vertices and indices
        const vertices = [];
        const indices = [];
    
        // Top circle vertices
        for (let i = 0; i < segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            vertices.push(Math.cos(theta) * topRadius, height, Math.sin(theta) * topRadius);
        }
    
        // Bottom circle vertices
        for (let i = 0; i < segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            vertices.push(Math.cos(theta) * bottomRadius, 0, Math.sin(theta) * bottomRadius);
        }
    
        // Center top vertex
        vertices.push(0, height, 0);
    
        // Indices for the side triangles
        for (let i = 0; i < segments; i++) {
            const a = i;
            const b = (i + 1) % segments;
            const c = i + segments;
            const d = (i + 1) % segments + segments;
    
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
  
        // Create BufferGeometry
        let funnelGeometry = new THREE.BufferGeometry();
        funnelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        funnelGeometry.setIndex(indices);
        funnelGeometry.computeVertexNormals(); // For proper lighting
    
        let funnelMesh = new THREE.Mesh(funnelGeometry, material);
        //funnelMesh.position.set(x, y + 100, z);
        funnelMesh.name = 'funnel';
        groupMesh.add(funnelMesh);

        createConvexTriangleShapeAddToCompound(compoundShape, funnelMesh);
    }
} 