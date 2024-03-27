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

    const textureCube = new THREE.CubeTextureLoader()
        .setPath('./src/assets/textures/yokohama/')
        .load([
            'posx.jpg',
            'negx.jpg',
            'posy.jpg',
            'negy.jpg',
            'posz.jpg',
            'negz.jpg',
        ]);
    scene.background = textureCube;

    const geometry = new THREE.SphereGeometry(1);
    const material = new THREE.MeshBasicMaterial({
        envMap: textureCube,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

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
