import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function scene(node: HTMLDivElement) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    node.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 15);

    const control = new OrbitControls(camera, renderer.domElement);
    control.enableDamping = true;

    // -------------- World Objects -------------- //
    interface WorldObjects {
        mesh: THREE.Mesh;
        body: CANNON.Body;
        id?: string;
        force?: number[];
    }

    const worldObjects: WorldObjects[] = [];
    const world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0),
    });

    const sphereMaterial = new CANNON.Material('sphere');
    const floorMaterial = new CANNON.Material('floor');
    const contactMaterial = new CANNON.ContactMaterial(
        sphereMaterial,
        floorMaterial,
        {
            friction: 0.1,
            restitution: 0.5,
        }
    );
    world.addContactMaterial(contactMaterial);

    // -------------- Mesh Objects -------------- //
    const createSphere = (
        radius: number,
        mass: number,
        x: number = 0,
        z: number = 0
    ) => {
        const geometry = new THREE.SphereGeometry(radius, 320, 160);
        const material = new THREE.MeshNormalMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        scene.add(mesh);

        const body = new CANNON.Body({
            mass,
            shape: new CANNON.Sphere(radius),
            material: sphereMaterial,
        });
        body.position.set(x, 10, z);
        world.addBody(body);
        const force1 = Math.random() > 0.5 ? Math.random() : Math.random() * -1;
        const force2 = Math.random() > 0.5 ? Math.random() : Math.random() * -1;
        worldObjects.push({
            mesh,
            body,
            id: 'sphere',
            force: [force1, force2],
        });
    };

    const createGround = () => {
        const geometry = new THREE.BoxGeometry(6, 6, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        scene.add(mesh);

        const body = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Box(new CANNON.Vec3(6 / 2, 6 / 2, 1 / 2)),
            material: floorMaterial,
        });
        body.position.set(0, -5, 0);
        body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        world.addBody(body);
        worldObjects.push({ mesh, body });
    };

    createSphere(1, 5);
    createGround();

    // -------------- Lights -------------- //
    const directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(0, 10, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);

    // -------------- Render & Resize -------------- //
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        control.update();
        world.fixedStep();
        worldObjects.forEach((obj) => {
            if (obj.id === 'sphere') {
                obj.body.applyForce(
                    new CANNON.Vec3(obj.force![0], 0, obj.force![1]),
                    obj.body.position
                );
            }
            obj.mesh.position.copy(obj.body.position);
            obj.mesh.quaternion.copy(obj.body.quaternion);
        });
    }
    render();

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    // -------------- Click Event -------------- //
    function onClick() {
        const radius = Math.random() + 0.5;
        const mass = Math.random() * 5 + 0.5;
        const x = Math.random() > 0.5 ? Math.random() : Math.random() * -1;
        const z = Math.random() > 0.5 ? Math.random() : Math.random() * -1;
        createSphere(radius, mass, x, z);
    }
    window.addEventListener('click', onClick);
}