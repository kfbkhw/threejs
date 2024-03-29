import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

export default function scene(node: HTMLDivElement) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    node.appendChild(renderer.domElement);
    const renderTarget = new THREE.WebGLRenderTarget(
        window.innerWidth,
        window.innerHeight
    );

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
        const poleGeometry = new THREE.CylinderGeometry(0.005, 0.005, 4.8);
        poleGeometry.rotateZ(Math.PI * -0.1);
        const ringGeometry = new THREE.TorusGeometry(
            2.4,
            0.005,
            120,
            480,
            Math.PI
        );
        ringGeometry.rotateZ(Math.PI * -0.6);

        const geometry = BufferGeometryUtils.mergeGeometries([
            poleGeometry,
            ringGeometry,
        ]);
        const material = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0.5,
        });
        const mesh = new THREE.Mesh(geometry, material);
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
    const ring = createRing();
    const stars = createStars(starTexture, 1000);

    // -------------- Lights -------------- //
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    // -------------- Post Processing -------------- //
    const composer = new EffectComposer(renderer, renderTarget);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const filmPass = new FilmPass(0.1, false);
    composer.addPass(filmPass);

    const shaderPass = new ShaderPass(GammaCorrectionShader);
    composer.addPass(shaderPass);

    const afterimagePass = new AfterimagePass(0.96);
    composer.addPass(afterimagePass);

    const unrealBloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1,
        1,
        0.9
    );
    composer.addPass(unrealBloomPass);

    const outlinePass = new OutlinePass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        scene,
        camera
    );
    outlinePass.selectedObjects = [];
    composer.addPass(outlinePass);

    const smaaPass = new SMAAPass(window.innerWidth, window.innerHeight);
    composer.addPass(smaaPass);

    // -------------- Render & Resize -------------- //
    function render() {
        requestAnimationFrame(render);
        composer.render();
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
