var camera;
var renderer;

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}


// 初始化
function init() {
    Physijs.scripts.worker = '../libs/other/physijs/physijs_worker.js';
    Physijs.scripts.ammo = './ammo.js';

    var stats = initStats();

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    // var scene = new THREE.Scene();
    var scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -10, 0));

    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    var contoller = setupControls();
    camera.position.set(contoller.camera_x, contoller.camera_y, contoller.camera_z);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var globalPlane1 = new THREE.Plane(new THREE.Vector3(1, 0, 0), 63),
        globalPlane2 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 63),
        globalPlane3 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 63),
        globalPlane4 = new THREE.Plane(new THREE.Vector3(0, 0, -1), 63);
    var globalPlanes = [globalPlane3, globalPlane4];
        // create a render and set the size
    renderer = initRenderer({
        antialias: true,
        alpha: true
    });
    renderer.localClippingEnabled = true;
    renderer.clippingPlanes = globalPlanes;

    // show axes in the screen
    var axes = new THREE.AxesHelper(30);
    scene.add(axes);

    // position and point the camera to the center of the scene
    // camera.position.x = -30;
    // camera.position.y = 40;
    // camera.position.z = 30;
    addLights(scene);

    var rem;
    // 加载模型
    var manager = new THREE.LoadingManager;
    var loaded = false;
    manager.onLoad = function () {
        console.log("资源加载完成");
        loaded = true;
    };
    var mtlLoader = new THREE.MTLLoader(manager);
    mtlLoader.setPath("../assets/test/")
    mtlLoader.load('rem.mtl', function (materials) {
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('../assets/test/rem.obj', function (object) {
            var rem = object;
            // scene.add(object);
            // object.position.y += 0;
            var remSize = getObjectSize(rem);
            var stoneGeom = new THREE.BoxGeometry(remSize.x, remSize.y, remSize.z);
            var stone = new Physijs.BoxMesh(stoneGeom, Physijs.createMaterial(new THREE.MeshStandardMaterial({
                color: 'white', transparent: true, opacity: 1, wireframe: true
            })));
            stone.position.copy(new THREE.Vector3(0, 3.5, 0));
            stone.add(object);
            scene.add(stone);
        });
    });
    //
    createGroundAndWalls(scene);
    // add the output of the renderer to the html element
    document.getElementById("select-scene").appendChild(renderer.domElement);

    // attach them here, since appendChild needs to be called first
    var trackballControls = initTrackballControls(camera, renderer);
    var clock = new THREE.Clock();
    render();
    // 适应窗口缩放
    window.addEventListener("resize", onResize, false);

    function render() {
        // update the stats and the controls
        trackballControls.update(clock.getDelta());
        stats.update();


        // render using requestAnimationFrame
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        scene.simulate();
    }
}

// 设置右上角的控制
function setupControls() {
    var controls = new function () {
        this.camera_x = 0;
        this.camera_y = 64;
        this.camera_z = -70;
    };

    var gui = new dat.GUI();
    gui.add(controls, 'camera_x', -100, 100).onChange(function (e) {
        camera.position.x = e;
    });
    gui.add(controls, 'camera_y', -100, 100).onChange(function (e) {
        camera.position.y = e;
    });
    gui.add(controls, 'camera_z', -100, 100).onChange(function (e) {
        camera.position.z = e;
    });
    return controls;
}

// 添加灯光
function addLights(scene) {
    // var keyLight = new THREE.SpotLight(0xffffff);
    // keyLight.position.set(0, 80, 80);
    // keyLight.intensity = 0;
    // keyLight.lookAt(new THREE.Vector3(0, 15, 0));
    // keyLight.castShadow = true;
    // keyLight.shadow.mapSize.height = 4096;
    // keyLight.shadow.mapSize.width = 4096;
    // scene.add(keyLight);
    //
    // var backlight1 = new THREE.SpotLight(0xaaaaaa);
    // backlight1.position.set(150, 40, -20);
    // backlight1.intensity = 0.1;
    // backlight1.lookAt(new THREE.Vector3(0, 15, 0));
    // scene.add(backlight1);
    //
    // var backlight2 = new THREE.SpotLight(0xaaaaaa);
    // backlight2.position.set(-150, 40, -20);
    // backlight2.intensity = 0.1;
    // backlight2.lookAt(new THREE.Vector3(0, 15, 0));
    // scene.add(backlight2);
    // add subtle ambient lighting
    var ambienLight = new THREE.AmbientLight(0x353535);
    scene.add(ambienLight);

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0, 50, 20);
    spotLight.castShadow = true;
    spotLight.intensity = 0.8;
    scene.add(spotLight);
    // 辅助
    var pp = new THREE.SpotLightHelper(spotLight)
    scene.add(pp)
}

// 获得物体尺寸
function getObjectSize(obj) {
    var objectBox = new THREE.Box3();
    objectBox.setFromObject(obj);
    return objectBox.max.sub(objectBox.min);
}

//
function createGroundAndWalls(scene) {
    var textureLoader = new THREE.TextureLoader();
    var ground_material = Physijs.createMaterial(
        new THREE.MeshStandardMaterial(
            {map: textureLoader.load('../assets/textures/general/wood-2.jpg')}
        ),
        .9, .3);

    var ground = new Physijs.BoxMesh(new THREE.BoxGeometry(60, 1, 60), ground_material, 0);
    ground.castShadow = true;
    ground.receiveShadow = true;

    var borderLeft = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, 60), ground_material, 0);
    borderLeft.position.x = -31;
    borderLeft.position.y = 2;
    borderLeft.castShadow = true;
    borderLeft.receiveShadow = true;

    ground.add(borderLeft);

    var borderRight = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 3, 60), ground_material, 0);
    borderRight.position.x = 31;
    borderRight.position.y = 2;
    borderRight.castShadow = true;
    borderRight.receiveShadow = true;

    ground.add(borderRight);

    var borderBottom = new Physijs.BoxMesh(new THREE.BoxGeometry(64, 3, 2), ground_material, 0);
    borderBottom.position.z = 30;
    borderBottom.position.y = 2;
    borderBottom.castShadow = true;
    borderBottom.receiveShadow = true;

    ground.add(borderBottom);

    var borderTop = new Physijs.BoxMesh(new THREE.BoxGeometry(64, 3, 2), ground_material, 0);
    borderTop.position.z = -30;
    borderTop.position.y = 2;
    borderTop.castShadow = true;
    borderTop.receiveShadow = true;

    ground.add(borderTop);

    scene.add(ground);
}