import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default async function scene(node: HTMLDivElement, onLoad: () => void) {
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
    camera.position.set(0, 100, 200);

    const control = new OrbitControls(camera, renderer.domElement);
    control.enableDamping = true;
    control.minDistance = 30;
    control.maxDistance = 500;
    control.minPolarAngle = Math.PI * 0.15;
    control.maxPolarAngle = Math.PI * 0.55;
    control.update();

    const $progressBar = document.getElementById(
        'loading-progress'
    ) as HTMLProgressElement;
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (_url, loaded, total) => {
        $progressBar.value = loaded / total;
    };
    loadingManager.onLoad = () => {
        onLoad();
    };

    const gltf = await new GLTFLoader(loadingManager).loadAsync(
        './src/models/amy.gltf'
    );
    const model = gltf.scene;
    model.traverse((obj) => {
        if (obj.isObject3D) {
            obj.castShadow = true;
        }
    });
    scene.add(model);

    const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
    const planeMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI / 2);
    plane.position.setY(-75);
    plane.receiveShadow = true;
    scene.add(plane);

    const spotLight = new THREE.SpotLight(
        0xffffff,
        50,
        0,
        Math.PI * 0.15,
        0.5,
        0.5
    );
    spotLight.position.setY(150);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.radius = 2;
    scene.add(spotLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x333333);
    hemisphereLight.position.set(0, 20, 10);
    scene.add(hemisphereLight);

    const ambientLight = new THREE.AmbientLight(0xffffff);
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
