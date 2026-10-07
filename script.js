import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";


// ========================================
// BASIC SETUP
// ========================================

const viewer = document.getElementById("viewer");

const loading = document.getElementById("loading");

const resetBtn = document.getElementById("resetBtn");

const rotateBtn = document.getElementById("rotateBtn");


// ========================================
// SCENE
// ========================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x10151b);


// ========================================
// CAMERA
// ========================================

const camera = new THREE.PerspectiveCamera(
    45,
    viewer.clientWidth / viewer.clientHeight,
    0.1,
    1000
);

camera.position.set(4, 2.5, 6);


// ========================================
// RENDERER
// ========================================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    viewer.clientWidth,
    viewer.clientHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.1;

viewer.appendChild(renderer.domElement);


// ========================================
// LIGHTS
// ========================================

const ambientLight = new THREE.HemisphereLight(
    0xffffff,
    0x202530,
    2
);

scene.add(ambientLight);


const keyLight = new THREE.DirectionalLight(
    0xffffff,
    4
);

keyLight.position.set(5, 8, 6);

keyLight.castShadow = true;

scene.add(keyLight);


const fillLight = new THREE.DirectionalLight(
    0x88bbff,
    2
);

fillLight.position.set(-5, 3, -4);

scene.add(fillLight);


// ========================================
// FLOOR
// ========================================

const floorGeometry = new THREE.CircleGeometry(10, 64);

const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x11161c,
    roughness: 0.8,
    metalness: 0.1
});

const floor = new THREE.Mesh(
    floorGeometry,
    floorMaterial
);

floor.rotation.x = -Math.PI / 2;

floor.position.y = -1;

floor.receiveShadow = true;

scene.add(floor);


// ========================================
// ORBIT CONTROLS
// ========================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

controls.dampingFactor = 0.08;

controls.enablePan = false;

controls.minDistance = 2;

controls.maxDistance = 12;

controls.target.set(0, 0, 0);


// ========================================
// LOAD GLB CAR
// ========================================

const loader = new GLTFLoader();

let car = null;

let autoRotate = false;


loader.load(

    "models/car.glb",

    function (gltf) {

        car = gltf.scene;

        scene.add(car);


        // --------------------------------
        // Calculate model size
        // --------------------------------

        const box = new THREE.Box3().setFromObject(car);

        const size = box.getSize(
            new THREE.Vector3()
        );

        const center = box.getCenter(
            new THREE.Vector3()
        );


        // Move model to center

        car.position.x -= center.x;

        car.position.y -= center.y;

        car.position.z -= center.z;


        // --------------------------------
        // Scale model
        // --------------------------------

        const maxSize = Math.max(
            size.x,
            size.y,
            size.z
        );

        const scale = 4 / maxSize;

        car.scale.setScalar(scale);


        // --------------------------------
        // Shadows
        // --------------------------------

        car.traverse(function (object) {

            if (object.isMesh) {

                object.castShadow = true;

                object.receiveShadow = true;

            }

        });


        // --------------------------------
        // Loading complete
        // --------------------------------

        loading.style.display = "none";

    },


    function (progress) {

        if (progress.total) {

            const percent =
                (progress.loaded / progress.total) * 100;

            console.log(
                "Loading:",
                percent.toFixed(0) + "%"
            );

        }

    },


    function (error) {

        console.error(
            "3D Model Error:",
            error
        );

        loading.innerHTML = `
            <div style="text-align:center;padding:20px">
                <h3>Car model could not load</h3>
                <p style="margin-top:8px;color:#aaa">
                    Check that models/car.glb exists.
                </p>
            </div>
        `;

    }

);


// ========================================
// AUTO ROTATE
// ========================================

rotateBtn.addEventListener(
    "click",
    function () {

        autoRotate = !autoRotate;

        controls.autoRotate = autoRotate;

        controls.autoRotateSpeed = 2;

        rotateBtn.classList.toggle(
            "active",
            autoRotate
        );

        rotateBtn.textContent =
            autoRotate
                ? "Stop Rotation"
                : "Auto Rotate";

    }
);


// ========================================
// RESET CAMERA
// ========================================

resetBtn.addEventListener(
    "click",
    function () {

        camera.position.set(
            4,
            2.5,
            6
        );

        controls.target.set(
            0,
            0,
            0
        );

        controls.update();

    }
);


// ========================================
// RESPONSIVE
// ========================================

window.addEventListener(
    "resize",
    function () {

        const width = viewer.clientWidth;

        const height = viewer.clientHeight;

        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(
            width,
            height
        );

    }
);


// ========================================
// ANIMATION LOOP
// ========================================

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(
        scene,
        camera
    );

}

animate();