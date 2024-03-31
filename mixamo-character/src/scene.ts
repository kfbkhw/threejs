import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

export default async function scene(node: HTMLDivElement, onLoad: () => void) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    node.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 50, 220);
	
    const scene = new THREE.Scene();
    const textureCube = new THREE.CubeTextureLoader()
        .setPath('./src/assets/textures/sky/')
        .load([
            'posx.jpg',
            'negx.jpg',
            'posy.jpg',
            'negy.jpg',
            'posz.jpg',
            'negz.jpg',
        ]);
    scene.background = textureCube;

    const control = new OrbitControls(camera, renderer.domElement);
    control.enableDamping = true;
    control.minDistance = 100;
    control.maxDistance = 400;
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
    const geometry = new THREE.CircleGeometry(200, 320);
    const material = new THREE.MeshPhongMaterial({
        transparent: true,
        opacity: 0.1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(-Math.PI / 2);
    mesh.position.setY(-75);
    mesh.receiveShadow = true;
    scene.add(mesh);

    const gltf = await new GLTFLoader(loadingManager).loadAsync(
        './src/assets/models/amy.gltf'
    );
    const model = gltf.scene;
    model.traverse((obj) => {
        if (obj.isObject3D) {
            obj.castShadow = true;
        }
    });
    scene.add(model);

    // -------------- Post Processing -------------- //
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const outlinePass = new OutlinePass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        scene,
        camera
    );
    composer.addPass(outlinePass);
    const shaderGamma = new ShaderPass(GammaCorrectionShader);
    composer.addPass(shaderGamma);

    // -------------- Lights -------------- //
    const spotLight = new THREE.SpotLight(
        0xffffff,
        10,
        1000,
        Math.PI * 0.15,
        0.5,
        0.5
    );
    spotLight.position.set(0, 200, -10);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 4096;
    spotLight.shadow.mapSize.height = 4096;
    scene.add(spotLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
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
        composer.render();
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
            outlinePass.selectedObjects = [];
            targetObject = null;
        } else if (object?.name === 'Ch46') {
            targetObject = object;
            outlinePass.selectedObjects = [object];
        }
    };
    window.addEventListener('pointerdown', onPointerDown);
}
