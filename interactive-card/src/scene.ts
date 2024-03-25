import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Card from './card';

export default function scene(node: HTMLDivElement) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    node.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.setZ(25);

    const control = new OrbitControls(camera, renderer.domElement);
    control.autoRotate = true;
    control.enableDamping = true;
    control.minPolarAngle = Math.PI / 4;
    control.maxPolarAngle = Math.PI - Math.PI / 4;
    control.update();

    const card = new Card({
        width: 10,
        height: 15.8,
        radius: 0.5,
        color: 0x0077ff,
    }).card;
    card.rotateZ(Math.PI * 0.01);
    scene.add(card);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff);
    const directionalLight2 = directionalLight1.clone();
    directionalLight1.position.set(1, 1, 5);
    directionalLight2.position.set(-1, 1, -5);
    scene.add(directionalLight1, directionalLight2);

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
