import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';

export default async function scene(node: HTMLDivElement) {
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
    camera.position.set(0, 1, 5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.update();

    const font = await new FontLoader().loadAsync(
        './src/assets/fonts/BlackHanSans_Regular.json'
    );
    const textGeometry = new TextGeometry('Hello, world!', {
        font,
        size: 0.5,
        height: 0.1,
        bevelEnabled: true,
        bevelSegments: 10,
        bevelSize: 0.01,
        bevelThickness: 0.01,
    });
    textGeometry.center();

    const textureLoader = new THREE.TextureLoader().setPath(
        './src/assets/texture/'
    );

    const texture = textureLoader.load('gradient.jpg');
    const textMaterial = new THREE.MeshPhongMaterial({
        map: texture,
    });

    const text = new THREE.Mesh(textGeometry, textMaterial);
    text.castShadow = true;
    scene.add(text);

    const planeGeometry = new THREE.PlaneGeometry(200, 200);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.setZ(-1);
    plane.receiveShadow = true;
    scene.add(plane);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(
        0xffffff,
        200,
        30,
        Math.PI * 0.1,
        0.4,
        0.4
    );

    const spotLightTexture = textureLoader.load('astronomy.jpg');
    spotLight.map = spotLightTexture;

    spotLight.position.set(0, 6, 3);
    spotLight.target.position.set(0, 0, -2);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight, spotLight.target);

    window.addEventListener('mousemove', (evt) => {
        const x = evt.clientX / window.innerWidth - 0.5;
        const y = (evt.clientY / window.innerHeight - 0.5) * -1;
        spotLight.position.set(x * 20, y * 20, 3);
    });

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const unrealBloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.2,
        0,
        0
    );

    composer.addPass(renderPass);
    composer.addPass(unrealBloomPass);

    function animate() {
        requestAnimationFrame(animate);
        composer.render();
        controls.update();
    }
    animate();

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
}
