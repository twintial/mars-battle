// 加载obj格式模型
function loadObjFromObj(mtl, obj, manager, onload) {
    const mtlLoader = new THREE.MTLLoader(manager);
    mtlLoader.setPath("assets/test/")
    mtlLoader.load(mtl, function (materials) {
        materials.preload();

        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(obj, onload);
    });
}

// 获得物体尺寸
function getObjectSize(obj) {
    var objectBox = new THREE.Box3();
    objectBox.setFromObject(obj);
    return objectBox.max.sub(objectBox.min);
}

// 添加灯光
function addCharaSceneLights(scene) {
    let ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.intensity = 0.4;
    scene.add(ambientLight);

    // add spotlight for the shadows
    let spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0, -50, 100);
    spotLight.castShadow = true;
    spotLight.intensity = 0.5;
    scene.add(spotLight);
    // // 辅助
    // var pp = new THREE.SpotLightHelper(spotLight)
    // scene.add(pp)

}

// 添加游戏灯光
function addGameSceneLights(scene) {
    // add spotlight for the shadows
    let spotLight = new THREE.SpotLight(0x9B0000);
    spotLight.position.set(0, 50, 0);
    spotLight.castShadow = true;
    spotLight.intensity = 0.5;
    scene.add(spotLight);
    // 辅助

    // let leftDirectLight = new THREE.DirectionalLight(0xffffff);
    // leftDirectLight.position.set(50, -10, 0);
    // leftDirectLight.castShadow = true;
    // leftDirectLight.shadow.camera.left = -50;
    // leftDirectLight.shadow.camera.right = 50;
    // leftDirectLight.shadow.camera.top = 50;
    // leftDirectLight.shadow.camera.bottom = -50;
    // leftDirectLight.intensity = 1;
    // scene.add(leftDirectLight);

    let frontDirectLight = new THREE.DirectionalLight(0xffffff);
    frontDirectLight.position.set(0, -1, -50);
    frontDirectLight.castShadow = true;
    frontDirectLight.shadow.camera.left = -50;
    frontDirectLight.shadow.camera.right = 50;
    frontDirectLight.shadow.camera.top = 50;
    frontDirectLight.shadow.camera.bottom = -50;
    frontDirectLight.intensity = 1;
    scene.add(frontDirectLight);

    // var shadowCamera = new THREE.CameraHelper(leftDirectLight.shadow.camera)
    // scene.add(shadowCamera)

}


function wrapMeshWithBoxPhysic(mesh, fri, res, mass, size) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    let physicBox = new Physijs.BoxMesh(geometry, Physijs.createMaterial(new THREE.MeshStandardMaterial({
        color: 'white', transparent: true, opacity: op, wireframe: isWF
    }), fri, res), mass);
    physicBox.add(mesh);
    return physicBox;
}

function wrapMeshWithSpherePhysic(mesh, fri, res, mass) {
    const size = getObjectSize(mesh);
    const d_2 = Math.pow(size.x, 2) + Math.pow(size.y, 2) + Math.pow(size.z, 2)
    const geometry = new THREE.SphereGeometry(Math.pow(d_2, 1 / 2) / 2, 20);
    let physicSphere = new Physijs.SphereMesh(geometry, Physijs.createMaterial(new THREE.MeshStandardMaterial({
        color: 'white', transparent: true, opacity: 1, wireframe: true
    }), fri, res), mass);
    physicSphere.add(mesh);
    return physicSphere;
}

function gameOver() {
    pause = true;
    $('#game-over').fadeIn();
}