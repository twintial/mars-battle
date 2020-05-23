// function onResize(camera, render) {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     render.setSize(window.innerWidth, window.innerHeight)
// }

function init() {
    var stats = initStats();
    // setup the scene for rendering
    // var camera = initCamera(new THREE.Vector3(50, 50, 50));
    // camera.lookAt(new THREE.Vector3(0, 0, 0));

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    // var scene = new THREE.Scene();


    // create a camera, which defines where we're looking at.
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    var loaderScene = new BaseLoaderScene(camera);

    // create a render and set the size
    // create a render and set the size
    // var renderer = new THREE.WebGLRenderer();
    //
    // renderer.setClearColor(new THREE.Color(0x000000));
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.shadowMap.enabled = true;
    // renderer.setClearColor(new THREE.Color(0x000000));
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // show axes in the screen
    // var axes = new THREE.AxesHelper(30);
    // scene.add(axes);

    // camers原本是在原点，朝着x+
    var contoller = setupControls();
    camera.position.set(contoller.camera_x, contoller.camera_y, contoller.camera_z);
    camera.lookAt(loaderScene.scene.position);

    // add subtle ambient lighting
    var ambienLight = new THREE.AmbientLight(0x353535);
    loaderScene.scene.add(ambienLight);

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-10, 20, -5);
    spotLight.castShadow = true;
    loaderScene.scene.add(spotLight);

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath("../assets/test/")
    mtlLoader.load('rem.mtl', function (materials) {
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('../assets/test/rem.obj', function (object) {

            // move wings to more horizontal position
            // [0, 2, 4, 6].forEach(function (i) {
            //     object.children[i].rotation.z = 0.3 * Math.PI
            // });
            //
            // [1, 3, 5, 7].forEach(function (i) {
            //     object.children[i].rotation.z = -0.3 * Math.PI
            // });

            // configure the wings,
            // var wing2 = object.children[5];
            // var wing1 = object.children[4];
            //
            // wing1.material.opacity = 0.9;
            // wing1.material.transparent = true;
            // wing1.material.depthTest = false;
            // wing1.material.side = THREE.DoubleSide;
            //
            // wing2.material.opacity = 0.9;
            // wing2.material.depthTest = false;
            // wing2.material.transparent = true;
            // wing2.material.side = THREE.DoubleSide;

            // object.scale.set(400, 400, 400);
            var mesh = object;
            object.position.set(0, 0, 0);
            object.translateX(0);
            object.translateY(0);
            object.translateZ(0);

            // object.rotation.x = 0.2;
            // object.rotation.y = -1.3;
            loaderScene.render(mesh, camera);
        });
    });

    // document.getElementById("webgl-output").appendChild(renderer.domElement);
    // var trackballControls = initTrackballControls(camera, renderer);
    // var clock = new THREE.Clock();
    // render();
    //
    // function render() {
    //     // update the stats and the controls
    //     trackballControls.update(clock.getDelta());
    //     stats.update();
    //
    //     // render using requestAnimationFrame
    //     requestAnimationFrame(render);
    //     renderer.render(scene, camera);
    // }

    function setupControls() {
        var controls = new function () {
            this.camera_x = 0;
            this.camera_y = 0;
            this.camera_z = 50;
        };

        var gui = new dat.GUI();
        gui.add(controls, 'camera_x', 0, 100).onChange(function (e) {
            camera.position.x = e;
        });
        gui.add(controls, 'camera_y', 0, 100).onChange(function (e) {
            camera.position.y = e;
        });
        gui.add(controls, 'camera_z', 0, 100).onChange(function (e) {
            camera.position.z = e;
        });
        return controls;
    }
}