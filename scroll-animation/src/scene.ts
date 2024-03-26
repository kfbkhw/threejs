import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export default async function scene(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf0f0f0, 0.1, 500);
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 25, 150);

    const control = new OrbitControls(camera, renderer.domElement);
    control.minPolarAngle = Math.PI / 4;
    control.maxPolarAngle = Math.PI / 2.3;
    control.update();

    const waveGeometry = new THREE.PlaneGeometry(1500, 1500, 150, 150);
    const waveMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
    });
    const wave = new THREE.Mesh(waveGeometry, waveMaterial);
    wave.receiveShadow = true;
    wave.rotateX(-Math.PI / 2);
    const waveHeight = 3;
    const initialZ: number[] = [];
    for (let i = 0; i < waveGeometry.attributes.position.count; i++) {
        const z =
            waveGeometry.attributes.position.getZ(i) +
            (Math.random() - 0.5) * waveHeight;
        waveGeometry.attributes.position.setZ(i, z);
        initialZ.push(z);
    }
    scene.add(wave);

    const updateWave = () => {
        const elapsedTime = clock.getElapsedTime();
        for (let i = 0; i < waveGeometry.attributes.position.count; i++) {
            const z =
                initialZ[i] + Math.sin(elapsedTime * 3 + i ** 2) * waveHeight;
            waveGeometry.attributes.position.setZ(i, z);
        }
        waveGeometry.attributes.position.needsUpdate = true;
    };

    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync('./src/models/ship/scene.gltf');
    const ship = gltf.scene;
    const shipHeight = 6;
    ship.rotateY(Math.PI);
    ship.position.setY(shipHeight);
    ship.scale.set(0.1, 0.1, 0.1);
    scene.add(ship);

    const updateShip = () => {
        const elapsedTime = clock.getElapsedTime();
        ship.position.setY(Math.sin(elapsedTime * 3) + shipHeight);
    };

    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;
    pointLight.shadow.radius = 10;
    pointLight.position.set(25, 10, 50);
    scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.radius = 10;
    directionalLight.position.set(40, 40, 40);
    scene.add(directionalLight);

    const clock = new THREE.Clock();

    function render() {
        requestAnimationFrame(render);
        updateWave();
        updateShip();
        camera.lookAt(ship.position);
        renderer.render(scene, camera);
    }
    render();

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
}
