import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

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
    camera.position.set(0, 0, 5);

    const control = new OrbitControls(camera, renderer.domElement);
    control.enableDamping = true;

    // -------------- Mesh Objects -------------- //
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // -------------- Lights -------------- //
    const directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(-5, 8, 5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);

    // -------------- Render & Resize -------------- //
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        control.update();
    }
    render();

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
}
