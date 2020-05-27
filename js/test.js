var renderer;
var cameras = [];
var scenes = [];
var loaded = false;
// 调试用相机
var observer;
var ob = true;
// 0为选择界面，1为游戏界面
var stage = 1;



var mixer
var clipAction
var animationClip
var mesh
var controls

function onResize() {
    cameras[stage].aspect = window.innerWidth / window.innerHeight;
    cameras[stage].updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}

// 调试用相机
function initObserver() {
    observer = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    // 0, 10, -15
    observer.position.set(0, 20, -60);
    observer.lookAt(new THREE.Vector3(0, 0, 0));
    window.addEventListener('keydown', function (e) {
        if (e.key === 'o') {
            ob = !ob;
        }
        if (e.key === 'l') {
            console.log(scenes[1]);
        }
    });
}


// 初始化
function init() {
    // init observer
    initObserver();
    // 初始化渲染器
    var globalPlane1 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 63),
        globalPlane2 = new THREE.Plane(new THREE.Vector3(0, 0, -1), 63);
    var globalPlanes = [globalPlane1, globalPlane2];
    renderer = initRenderer({
        antialias: true,
        alpha: false
    });
    renderer.localClippingEnabled = true;
    renderer.clippingPlanes = globalPlanes;

    var controller = setupControls(0, 10, -15);
    let selectScene = initSelectionScene(controller);
    let gameScene = initGameScene(controller);
    scenes.push(selectScene);
    scenes.push(gameScene);


    document.getElementById("scene").appendChild(renderer.domElement);
    var stats = initStats();
    // attach them here, since appendChild needs to be called first
    var trackballControls = initTrackballControls(observer, renderer);
    var clock = new THREE.Clock();
    //createMonster();
    render();
    // 适应窗口缩放
    window.addEventListener("resize", onResize, false);

    function render() {
        // update the stats and the controls
        const delta = clock.getDelta();
        trackballControls.update(delta);
        stats.update();
        // render using requestAnimationFrame
        requestAnimationFrame(render);
        // scene = gameScene;
        // scene = selectScene;
        if (ob) {
            renderer.render(scenes[stage], observer);
        } else {
            renderer.render(scenes[stage], cameras[stage]);
        }
        if (stage === 1) {
            scenes[stage].simulate();
        }
        TWEEN.update();

        if (mixer && clipAction) {
            mixer.update(delta);
            // controls.time = mixer.time;
            // controls.effectiveTimeScale = clipAction.getEffectiveTimeScale();
            // controls.effectiveWeight = clipAction.getEffectiveWeight();
        }
    }
}

function initSelectionScene(controller) {

    // create a camera, which defines where we're looking at.
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    // 0, 64,-70
    camera.position.set(0, 5, 15);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameras.push(camera);

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var selectScene = new THREE.Scene();

    var axes = new THREE.AxesHelper(30);
    selectScene.add(axes);

    var manager = new THREE.LoadingManager;
    manager.onLoad = function () {
        console.log("资源加载完成");
        loaded = true;
    };
    const domEvent = new THREEx.DomEvents(camera, renderer.domElement);
    loadObjFromObj('rem.mtl', '../assets/test/rem.obj', manager, function (object) {
        // 添加点击事件
        domEvent.addEventListener(object, 'click', function (object3D) {
            // 切换场景
            let gameScene = initGameScene(controller);
            scenes.push(gameScene);
            stage = 1;
            // 去除
            domEvent.removeEventListener(object, 'click');
        })
        let initPos = new THREE.Vector3(0, 0, 0);
        object.position.copy(initPos);
        selectScene.add(object);
    });
    addLights(selectScene);
    return selectScene;
}

function initGameScene(controller) {
    Physijs.scripts.worker = '../libs/other/physijs/physijs_worker.js';
    Physijs.scripts.ammo = './ammo.js';
    // 创建物理场景
    var gameScene = new Physijs.Scene();
    gameScene.setGravity(new THREE.Vector3(0, -10, 0));

    // create a camera, which defines where we're looking at.
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    // 0, 10, -15
    camera.position.set(0, 10, -15);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameras.push(camera);

    // show axes in the screen
    var axes = new THREE.AxesHelper(30);
    gameScene.add(axes);

    // position and point the camera to the center of the scene
    addLights(gameScene);

    // 加载模型
    var manager = new THREE.LoadingManager;
    manager.onLoad = function () {
        console.log("资源加载完成");
        loaded = true;
    };
    const domEvent = new THREEx.DomEvents(camera, renderer.domElement);
    loadObjFromObj('rem.mtl', '../assets/test/rem.obj', manager, function (object) {
        // 添加碰撞box
        var size = getObjectSize(object);
        var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        var physicBox = new Physijs.BoxMesh(geometry, Physijs.createMaterial(new THREE.MeshStandardMaterial({
            color: 'white', transparent: true, opacity: 1, wireframe: true
        }), .9, 0), 1e9);
        let initPos = new THREE.Vector3(0, 3.5, 0);
        physicBox.position.copy(initPos);
        physicBox.add(object);
        // 添加碰撞检测
        physicBox.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
            // this是当前监听的模型，other_object是与之碰撞的对象，relative_velocity是两个模型之间的速度力差，relative_rotation是两个模型旋转之间的差
            if (other_object.name !== 'ground') {
                console.log(other_object);
                // scenes[stage].remove(other_object);
            }
        });
        physicBox.setCcdMotionThreshold(1);
        physicBox.setCcdSweptSphereRadius(0.2);
        physicBox.name = 'rem';
        // 添加控制
        addWalk(physicBox);
        gameScene.add(physicBox);
        // 改变相机关注点
        camera.lookAt(physicBox.position);
    });


    //
    createGroundAndWalls(gameScene);
    // add the output of the renderer to the html element
    return gameScene;
}

// 设置右上角的控制
function setupControls(x, y, z) {
    var controls = new function () {
        this.camera_x = x;
        this.camera_y = y;
        this.camera_z = z;
    };

    var gui = new dat.GUI();
    gui.add(controls, 'camera_x', -100, 100).onChange(function (e) {
        cameras[stage].position.x = e;
    });
    gui.add(controls, 'camera_y', -100, 100).onChange(function (e) {
        cameras[stage].position.y = e;
    });
    gui.add(controls, 'camera_z', -100, 100).onChange(function (e) {
        cameras[stage].position.z = e;
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

function loadObjFromObj(mtl, obj, manager, onload) {
    var mtlLoader = new THREE.MTLLoader(manager);
    mtlLoader.setPath("../assets/test/")
    mtlLoader.load(mtl, function (materials) {
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(obj, onload);
    });
}

function addWalk(phyObj) {
    window.addEventListener('keydown', function (e) {
        let step = 0.5;
        if (e.key === 'w') {
            phyObj.translateZ(step);
            phyObj.children[0].lookAt(new THREE.Vector3(0, 0, 1));
            cameras[stage].position.z += step;
            // new TWEEN.Tween(phyObj.position).to({z: phyObj.position.z + step},1000).start();
            // new TWEEN.Tween(cameras[stage].position).to({z: cameras[stage].position.z + step},100).start();
        } else if (e.key === 'a') {
            phyObj.translateX(step);
            phyObj.children[0].lookAt(new THREE.Vector3(1, 0, 0));
            cameras[stage].position.x += step;
        } else if (e.key === 's') {
            phyObj.translateZ(-step);
            phyObj.children[0].lookAt(new THREE.Vector3(0, 0, -1));
            cameras[stage].position.z -= step;
        } else if (e.key === 'd') {
            phyObj.translateX(-step);
            phyObj.children[0].lookAt(new THREE.Vector3(-1, 0, 0));
            cameras[stage].position.x -= step;
        } else if (e.key === 'g') {
            // 恢复
            console.log(x.sub(phyObj.position));
        }
        cameras[stage].lookAt(phyObj.position );
        // console.log(cameras[stage].position);
        phyObj.__dirtyPosition = true;
    });
}

//
function createGroundAndWalls(scene) {
    var textureLoader = new THREE.TextureLoader();
    var ground_material = Physijs.createMaterial(
        new THREE.MeshStandardMaterial(
            {map: textureLoader.load('../../assets/textures/general/wood-2.jpg')}
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

function createMonster() {
    mixer = new THREE.AnimationMixer();
    var loader = new THREE.ColladaLoader();
    loader.load('../assets/models/monster/monster.dae', function (result) {
        console.log(result);
        scenes[stage].add(result.scene);
        // result.scene.rotateZ(-0.2*Math.PI)
        // result.scene.translateX(-40)
        // result.scene.translateY(-40)
        result.scene.scale.copy(new THREE.Vector3(0.005, 0.005, 0.005));
        // setup the mixer
        mixer = new THREE.AnimationMixer(result.scene);
        animationClip = result.animations[0];
        clipAction = mixer.clipAction(animationClip).play();
        animationClip = clipAction.getClip();

        //var size = getObjectSize(result.scene);
        result.scene.position.copy(new THREE.Vector3(-5, -2, 0))
        var geometry = new THREE.BoxGeometry(9, 6, 5);
        var physicBox = new Physijs.BoxMesh(geometry, Physijs.createMaterial(new THREE.MeshStandardMaterial({
            color: 'white', transparent: true, opacity: 1, wireframe: true
        }), 1, 0));
        let initPos = new THREE.Vector3(-10, 10, 10);
        physicBox.position.copy(initPos);
        physicBox.add(result.scene);

        // physicBox.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
        //     // this是当前监听的模型，other_object是与之碰撞的对象，relative_velocity是两个模型之间的速度力差，relative_rotation是两个模型旋转之间的差
        //     console.log("aaaaaaa")
        //     if (other_object.name === 'rem') {
        //         console.log(other_object);
        //         // scenes[stage].remove(other_object);
        //     }
        // });
        // 添加控制
        // addWalk(physicBox);
        scenes[stage].add(physicBox);
        // 更改播放速度
        mixer.timeScale = 1;
        // add the animation controls
        //enableControls();
        addClipActionFolder(clipAction);
    });
}