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

    // -------------- Textures -------------- //
    const textureLoader = new THREE.TextureLoader().setPath(
        './src/assets/textures/'
    );
    const skyTextureLoader = new THREE.CubeTextureLoader().setPath(
        './src/assets/textures/sky/'
    );

    const earthTexture = textureLoader.load('earth.jpg');
    const starTexture = textureLoader.load('star.jpeg');
    const skyTexture = skyTextureLoader.load([
        'px.png',
        'nx.png',
        'py.png',
        'ny.png',
        'pz.png',
        'nz.png',
    ]);
    scene.background = skyTexture;

    // -------------- Mesh Objects -------------- //
    const createEarthLg = (texture: THREE.Texture) => {
        const geometry = new THREE.SphereGeometry(2, 640, 320);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: 0.6,
            side: THREE.BackSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateZ(Math.PI * -0.1);
        scene.add(mesh);
        return mesh;
    };

    const createEarthSm = (texture: THREE.Texture) => {
        const geometry = new THREE.SphereGeometry(1.8, 640, 320);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8,
            side: THREE.FrontSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateZ(Math.PI * -0.1);
        scene.add(mesh);
        return mesh;
    };

    const createPole = () => {
        const geometry = new THREE.CylinderGeometry(0.005, 0.005, 4.8);
        const material = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0.5,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateZ(Math.PI * -0.1);
        scene.add(mesh);
        return mesh;
    };

    const createPoleRing = () => {
        const geometry = new THREE.TorusGeometry(2.4, 0.005, 120, 480, Math.PI);
        const material = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0.5,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateZ(Math.PI * -0.6);
        scene.add(mesh);
        return mesh;
    };

    const createRing = () => {
        const geometry = new THREE.TorusGeometry(2.6, 0.005, 120, 480);
        const material = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0.5,
            color: 0xf6d776,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateX(Math.PI / 2);
        mesh.rotateZ(Math.PI / 2);
        scene.add(mesh);
        return mesh;
    };

    const createStars = (texture: THREE.Texture, count: number) => {
        const vertices = [];
        for (let i = 0; i < count; i++) {
            const x = THREE.MathUtils.randFloatSpread(100);
            const y = THREE.MathUtils.randFloatSpread(100);
            const z = THREE.MathUtils.randFloatSpread(100);
            vertices.push(x, y, z);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(vertices, 3)
        );
        const material = new THREE.PointsMaterial({
            map: texture,
            alphaMap: texture,
            transparent: true,
            depthWrite: false,
            color: 0xeeeeee,
            size: 0.5,
        });
        const points = new THREE.Points(geometry, material);
        scene.add(points);
        return points;
    };

    const earthLg = createEarthLg(earthTexture);
    const earthSm = createEarthSm(earthTexture);
    createPole();
    createPoleRing();
    const ring = createRing();
    const stars = createStars(starTexture, 1000);

    // -------------- Lights -------------- //
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    // -------------- Render & Resize -------------- //
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        control.update();
        earthLg.rotation.y += 0.0005;
        earthSm.rotation.y -= 0.0005;
        ring.rotation.x -= 0.005;
        ring.rotation.y -= 0.005;
        stars.rotation.x += 0.0001;
        stars.rotation.y += 0.0001;
        stars.rotation.z += 0.0001;
    }
    render();

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
}
