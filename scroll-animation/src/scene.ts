import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default async function scene(canvas: HTMLCanvasElement) {
    gsap.registerPlugin(ScrollTrigger);

    const COLORS = {
        waveColor: '#41C9E2',
        backgroundColor: '#ffffff',
        fogColor: '#DFF5FF',
    };

    const NEW_COLORS = {
        waveColor: '#7469B6',
        backgroundColor: '#FFE6E6',
        fogColor: '#E1AFD1',
    };

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color(COLORS.fogColor), 0, 600);
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
    control.enableZoom = false;
    control.enablePan = false;
    control.enableDamping = true;
    control.update();

    const waveGeometry = new THREE.PlaneGeometry(1500, 1500, 150, 150);
    const waveMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(COLORS.waveColor),
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

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.radius = 10;
    directionalLight.position.set(40, 40, 40);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const clock = new THREE.Clock();
    const $title = document.querySelector('.title') as HTMLHeadingElement;
    let prevScrollPos = 0;

    function render() {
        requestAnimationFrame(render);
        updateWave();
        updateShip();
        control.update();
        camera.lookAt(ship.position);
        renderer.render(scene, camera);
        if (window.scrollY === prevScrollPos) return;
        if (window.scrollY < 1500) {
            $title.innerHTML = 'Three.js Scroll Animation';
            $title.style.color = '#008DDA';
            prevScrollPos = window.scrollY;
        } else {
            $title.innerHTML = 'The End';
            $title.style.color = '#D875C7';
            prevScrollPos = window.scrollY;
        }
    }
    render();

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.scroll',
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
        },
    });

    timeline
        .to('.title', {
            opacity: 0,
            duration: 1.5,
        })
        .to(
            COLORS,
            {
                waveColor: NEW_COLORS.waveColor,
                onUpdate: () => {
                    waveMaterial.color = new THREE.Color(COLORS.waveColor);
                },
                duration: 1.5,
            },
            '<'
        )
        .to(
            COLORS,
            {
                backgroundColor: NEW_COLORS.backgroundColor,
                onUpdate: () => {
                    scene.background = new THREE.Color(COLORS.backgroundColor);
                },
                duration: 1.5,
            },
            '<'
        )
        .to(
            COLORS,
            {
                fogColor: NEW_COLORS.fogColor,
                onUpdate: () => {
                    scene.fog!.color = new THREE.Color(COLORS.fogColor);
                },
                duration: 1.5,
            },
            '<'
        )
        .to(camera.position, {
            x: 50,
            z: -50,
            duration: 2.5,
        })
        .to(ship.position, {
            z: 100,
            duration: 1,
        })
        .to(camera.position, {
            x: -50,
            y: 25,
            z: 100,
            duration: 2,
        })
        .to(camera.position, {
            x: 0,
            y: 0,
            z: 200,
            duration: 1,
        })
        .to(
            '.title',
            {
                opacity: 1,
                duration: 1.5,
            },
            '<'
        );
}
