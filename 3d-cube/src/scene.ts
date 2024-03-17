import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';

export default function scene(node: HTMLDivElement) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    node.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
	
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.enableDamping = true;

    const icosahedronColor = { color: 0x378ce7 };
    const icosahedronGeometry = new THREE.IcosahedronGeometry(1);
    const icosahedronMaterial = new THREE.MeshStandardMaterial({
        color: icosahedronColor.color,
        roughness: 0,
    });
    const icosahedron = new THREE.Mesh(
        icosahedronGeometry,
        icosahedronMaterial
    );
    scene.add(icosahedron);

    const skeletonGeometry = new THREE.IcosahedronGeometry(2);
    const skeletonMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
        wireframe: true,
    });
    const skeleton = new THREE.Mesh(skeletonGeometry, skeletonMaterial);
    scene.add(skeleton);

    camera.position.set(0, 0, 5);
    controls.update();

    const directionalLight = new THREE.DirectionalLight(0xf0f0f0, 5);
    directionalLight.position.set(-5, 8, 5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    function animate() {
        requestAnimationFrame(animate);
        icosahedron.rotation.x += 0.01;
        icosahedron.rotation.y += 0.01;
        skeleton.rotation.x += 0.012;
        skeleton.rotation.y += 0.012;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    const gui = new GUI();
    gui.add(icosahedron.position, 'x', -3, 3, 0.1);
    gui.add(icosahedron.position, 'y', -3, 3, 0.1);
    gui.add(icosahedron.position, 'z', -3, 3, 0.1);
    gui.add(icosahedron, 'visible');
    gui.addColor(icosahedronColor, 'color').onChange((v) => {
        icosahedron.material.color.set(v);
    });
}
