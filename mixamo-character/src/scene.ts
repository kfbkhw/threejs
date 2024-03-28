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
    camera.position.set(0, 50, 220);

    const control = new OrbitControls(camera, renderer.domElement);
    control.enableDamping = true;
    control.minDistance = 30;
    control.maxDistance = 500;
    control.minPolarAngle = Math.PI * 0.15;
    control.maxPolarAngle = Math.PI * 0.55;
    control.update();

    // -------------- Loading Manager -------------- //
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

    // -------------- Mesh Objects -------------- //
    const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
    const planeMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI / 2);
    plane.position.setY(-75);
    plane.receiveShadow = true;
    scene.add(plane);

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

    // -------------- Lights -------------- //
    const spotLight = new THREE.SpotLight(
        0xffffff,
        60,
        1000,
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
    hemisphereLight.position.set(0, -50, 10);
    scene.add(hemisphereLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // -------------- Animation Mixer -------------- //
    const mixer = new THREE.AnimationMixer(model);
    const defaultAction = mixer.clipAction(gltf.animations[0]);
    let currentAction = defaultAction;
    currentAction.clampWhenFinished = true;
    currentAction.play();

    const $combatAction = document.getElementById(
        'combat-action'
    ) as HTMLDivElement;
    const $danceAction = document.getElementById(
        'dance-action'
    ) as HTMLDivElement;
    ($combatAction.querySelector('h2') as HTMLHeadingElement).innerHTML =
        'Combat';
    ($danceAction.querySelector('h2') as HTMLHeadingElement).innerHTML =
        'Dance';

    const actions = gltf.animations.slice(1);
    for (let i = 0; i < actions.length; i++) {
        const button = document.createElement('button');
        button.innerHTML = actions[i].name;
        button.onclick = () => {
            const prevAction = currentAction;
            currentAction = mixer.clipAction(actions[i]);
            if (prevAction === currentAction && prevAction.isRunning()) {
                return;
            }
            prevAction.fadeOut(1);
            currentAction.reset().setLoop(THREE.LoopRepeat, 2).fadeIn(1).play();
        };
        if (i < 4) {
            button.classList.add('combat-action-btn');
            $combatAction.appendChild(button);
        } else {
            button.classList.add('dance-action-btn');
            $danceAction.appendChild(button);
        }
    }

    const handleAnimationFinished = () => {
        const prevAction = currentAction;
        currentAction = defaultAction;
        prevAction.fadeOut(1);
        currentAction.reset().fadeIn(1).play();
    };
    mixer.addEventListener('finished', handleAnimationFinished);

    // -------------- Render & Resize -------------- //
    const clock = new THREE.Clock();
    function render() {
        const delta = clock.getDelta();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        control.update();
        mixer.update(delta);
    }
    render();

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    // -------------- Raycaster -------------- //
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let targetObject: THREE.Mesh | null;
    const onPointerDown = (event: MouseEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        const object = intersects[0]?.object as THREE.Mesh;
        if (targetObject) {
            (targetObject.material as THREE.MeshStandardMaterial).color.set(
                0xffffff
            );
            targetObject = null;
        } else if (object?.name === 'Ch46') {
            targetObject = object;
            (object.material as THREE.MeshStandardMaterial).color.set(0x5755fe);
        }
    };
    window.addEventListener('pointerdown', onPointerDown);
}
