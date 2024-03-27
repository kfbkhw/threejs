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
    control.update();

    const particlesCount = 10000;
    const particlesVertices = [];
    for (let i = 0; i < particlesCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(100);
        const y = THREE.MathUtils.randFloatSpread(100);
        const z = THREE.MathUtils.randFloatSpread(100);
        particlesVertices.push(x, y, z);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(particlesVertices, 3)
    );
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xe1afd1,
        size: 0.01,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const directionalLight = new THREE.DirectionalLight(0xf0f0f0, 5);
    directionalLight.position.set(-5, 8, 5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        control.update();
    }
    animate();

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
}
