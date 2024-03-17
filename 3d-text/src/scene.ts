import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';
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
    controls.enableDamping = true;

    const loader = new FontLoader();
    loader.load(
        './src/assets/fonts/BlackHanSans_Regular.json',
        (font) => {
            const textGeometry = new TextGeometry('Hello, world!', {
                font,
                size: 0.5,
                height: 0.1,
            });
            textGeometry.computeBoundingBox();
            textGeometry.translate(
                -(
                    (textGeometry.boundingBox!.max.x -
                        textGeometry.boundingBox!.min.x) /
                    2
                ),
                0,
                0
            );

            const textMaterial = new THREE.MeshPhongMaterial({
                color: 0x378ce7,
            });
            const text = new THREE.Mesh(textGeometry, textMaterial);
            scene.add(text);
        },
        (evt) => console.log('progress', evt),
        (err) => console.log('error', err)
    );

    camera.position.set(0, 0, 5);
    controls.update();

    const directionalLight = new THREE.DirectionalLight(0xf0f0f0, 10);
    directionalLight.position.set(0, 10, 1);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf0f0f0, 5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    function animate() {
        requestAnimationFrame(animate);
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
    gui.add(pointLight.position, 'x', -10, 10, 0.1);
    gui.add(pointLight.position, 'y', -10, 10, 0.1);
    gui.add(pointLight.position, 'z', -10, 10, 0.1);
}
