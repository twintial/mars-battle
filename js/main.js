var pause = false;
var isWF = false;
var op = 0;

function init() {
    Physijs.scripts.worker = 'libs/other/physijs/physijs_worker.js';
    Physijs.scripts.ammo = './ammo.js';
    let scenes = {
        charaScene: {
            camera: new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000),
            scene: new THREE.Scene()
        },
        gameScene: {
            camera: new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000),
            scene: new Physijs.Scene()
        }
    }
    let chara = {
        rem: new Rem(),
        knight: new Knight(),
        fox: new Fox()
    }
    let currentChara = chara.rem;
    let canShoot = true;

    let heartPhysic = null;

    let monsterList = [];

    // 1
    let stage = 'charaScene';
    //let stage = 'gameScene';

    let renderer;
    let observer;
    let ob = false;
    initObserver()
    initScene();

    // 调试用相机
    function initObserver() {
        //ob = true;
        observer = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
        // 0, 10, -15
        observer.position.set(0, 20, -60);
        observer.lookAt(new THREE.Vector3(0, 0, 0));
        window.addEventListener('keydown', function (e) {
            if (e.key === 'o') {
                ob = !ob;
            }
            if (e.key === 'l') {
                console.log(scenes[stage]);
            }
        });
    }

    function initScene() {
        // 开始按键
        $('#start').on('click', function (e) {
            $('#start').unbind();
            $('#chara-intro').hide();
            initGameScene();
        })
        // 重新开始
        $('#restart').on('click', function (e) {
            $('#restart').unbind();
            // 清空场景
            $('#scene').empty();
            $('#blood-bar').hide();
            $('#chara-blood-bar').hide();
            $('#score-box').hide();
            $('#game-over').hide();
            pause = false;
            init();
        })

        renderer = initRenderer({
            antialias: true,
            alpha: false
        });

        // 2
        initCharaScene();
        //initGameScene();

        document.getElementById("scene").appendChild(renderer.domElement);
        const stats = initStats();
        // attach them here, since appendChild needs to be called first
        const trackballControls = initTrackballControls(observer, renderer);
        const clock = new THREE.Clock();
        // 适应窗口缩放
        window.addEventListener("resize", onResize, false);
        render();

        function render() {
            // update the stats and the controls
            if (!pause) {
                const delta = clock.getDelta();
                trackballControls.update(delta);
                stats.update();
                // render using requestAnimationFrame
                if (ob) {
                    renderer.render(scenes[stage].scene, observer);
                } else {
                    renderer.render(scenes[stage].scene, scenes[stage].camera);
                }
                if (stage === 'gameScene') {
                    if (currentChara.physicMesh != null){
                        if (currentChara.physicMesh.position.y < -20) {
                            gameOver();
                        }
                    }
                    towardsPlayer(monsterList, currentChara.physicMesh);
                    scenes[stage].scene.simulate();
                }
                TWEEN.update();
                requestAnimationFrame(render);
                // if (mixer && clipAction) {
                //     mixer.update(delta);
                // }
                for (let index in monsterList) {
                    monsterList[index].mixer.update(delta);
                }
            }
        }
    }

    function onResize() {
        scenes[stage].camera.aspect = window.innerWidth / window.innerHeight;
        scenes[stage].camera.updateProjectionMatrix();
        observer.aspect = window.innerWidth / window.innerHeight;
        observer.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight)
    }

    function initCharaScene() {
        loading();
        $('#chara-intro').fadeIn();
        // 0, 64,-70
        scenes.charaScene.camera.position.set(0, -50, 150);
        scenes.charaScene.camera.lookAt(new THREE.Vector3(0, 0, 0));
        scenes.charaScene.scene.background = new THREE.CubeTextureLoader()
            .setPath("img/skybox/space/")
            .load([
                'Outer_space_nx.png', 'Outer_space_nx.png',
                'Outer_space_nx.png', 'Outer_space_nx.png',
                'Outer_space_nx.png', 'Outer_space_nx.png']);

        // const axes = new THREE.AxesHelper(30);
        // scenes.charaScene.scene.add(axes);

        addCharaSceneLights(scenes.charaScene.scene);

        const manager = new THREE.LoadingManager;
        manager.onLoad = function () {
            console.log("charaScene资源加载完成");
            loaded();
        };
        let arrow = createArrow();
        scenes.charaScene.scene.add(arrow);
        const domEvent = new THREEx.DomEvents(scenes.charaScene.camera, renderer.domElement);
        for (let key in chara) {
            loadObjFromObj(chara[key].mtl, chara[key].obj, manager, function (object) {
                chara[key].mesh = object;
                object.position.copy(chara[key].initPos);
                object.rotation.x = chara[key].initRot.x;
                object.rotation.y = chara[key].initRot.y;
                let temp = object.clone();
                temp.scale.copy(chara[key].initScale);
                // 添加点击事件
                domEvent.addEventListener(temp, 'click', function (object3D) {
                    arrow.position.x = object.position.x;
                    arrow.rotation.copy(object.rotation);
                    $('#intro').html(chara[key].intro)
                    // temp.rotation.y = 1/7 *Math.PI;
                    // // 切换场景
                    currentChara = chara[key];
                    // initGameScene();
                    // stage = 'gameScene';
                    // // 去除
                    // domEvent.removeEventListener(temp, 'click');
                })
                scenes.charaScene.scene.add(temp);
            });
        }
    }

    function initGameScene() {
        loading();
        // 创建物理场景
        // scenes.gameScene.scene = new Physijs.Scene()
        scenes.gameScene.scene.setGravity(new THREE.Vector3(0, -10, 0));
        scenes.gameScene.scene.background = new THREE.CubeTextureLoader()
            .setPath("img/skybox/mars/")
            .load([
                'mars_posx.jpg', 'mars_negx.jpg',
                'mars_posy.jpg', 'mars_negy.jpg',
                'mars_posz.jpg', 'mars_negz.jpg']);

        // 0,10,-15
        scenes.gameScene.camera.position.set(0, 20, -60);
        // camera.lookAt(new THREE.Vector3(0, 0, 0));
        // show axes in the screen
        // const axes = new THREE.AxesHelper(30);
        // scenes.gameScene.scene.add(axes);

        // position and point the camera to the center of the scene
        addGameSceneLights(scenes.gameScene.scene);

        // 加载模型
        const manager = new THREE.LoadingManager;
        manager.onLoad = function () {
            console.log("gameScene资源加载完成");
            stage = 'gameScene';
            loaded();
        };
        // // 添加碰撞检测
        // currentChara.physicMesh = wrapMeshWithPhysic(currentChara.mesh);
        // currentChara.physicMesh.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
        //     // this是当前监听的模型，other_object是与之碰撞的对象，relative_velocity是两个模型之间的速度力差，relative_rotation是两个模型旋转之间的差
        //     if (other_object.name !== 'ground') {
        //         console.log(other_object);
        //         // scenes[stage].remove(other_object);
        //     }
        // });
        // // physicBox.setCcdMotionThreshold(1);
        // // physicBox.setCcdSweptSphereRadius(0.2);
        // // 添加控制
        // addAction(currentChara.physicMesh);
        // scenes.gameScene.scene.add(currentChara.physicMesh);
        // // 改变相机关注点
        // scenes.gameScene.camera.lookAt(currentChara.physicMesh.position);
        // 测试
        loadObjFromObj(currentChara.mtl, currentChara.obj, manager, function (object) {
            // 添加碰撞box
            object.scale.copy(currentChara.initScale.multiplyScalar(0.1));
            var size = getObjectSize(object);
            var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
            var physicBox = new Physijs.BoxMesh(geometry, Physijs.createMaterial(new THREE.MeshStandardMaterial({
                color: 'white', transparent: true, opacity: op, wireframe: isWF
            }), .9, 0), 1e9);
            let initPos = new THREE.Vector3(0, 3.5, 0);
            physicBox.position.copy(initPos);
            physicBox.scale.copy(currentChara.physicScale);
            physicBox.add(object);
            // 添加碰撞检测
            // physicBox.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
            //     // this是当前监听的模型，other_object是与之碰撞的对象，relative_velocity是两个模型之间的速度力差，relative_rotation是两个模型旋转之间的差
            //     if (other_object.name !== 'ground') {
            //         // console.log(other_object);
            //         // scenes[stage].remove(other_object);
            //     }
            // });
            physicBox.setCcdMotionThreshold(1);
            physicBox.setCcdSweptSphereRadius(0.2);
            physicBox.name = 'chara';
            // 添加控制
            currentChara.physicMesh = physicBox;
            addAction(currentChara);
            scenes.gameScene.scene.add(physicBox);
            // 改变相机关注点
            scenes.gameScene.camera.lookAt(physicBox.position);
            // 血条可视化
            $('#chara-blood-bar').show();
            $('#chara-name').html(currentChara.name);
            $('#chara-bar').width(currentChara.health * 100 / currentChara.blood + '%')
                .html(currentChara.health + '/' + currentChara.blood);
            // 得分可视化
            $('#score-box').show();

        });

        // 构建场地
        createGroundAndWalls(scenes.gameScene.scene);

        // 生成道具，需要销毁
        setInterval(function () {
            createHeart(scenes.gameScene.scene);
        }, 5000)
        // 生成怪物，需要销毁
        createMonster1(scenes.gameScene.scene, monsterList);
        createMonster2(scenes.gameScene.scene, monsterList);
        setInterval(function () {
            if (Math.random() < 0.5) {
                createMonster1(scenes.gameScene.scene, monsterList);
            } else {
                createMonster2(scenes.gameScene.scene, monsterList);
            }
        }, 5000);
    }

    function addAction(currentChara) {
        window.addEventListener('keydown', function (e) {
            let phyObj = currentChara.physicMesh;
            let orient = currentChara.orient;
            let speed = currentChara.speed;
            if (e.key === 'w') {
                phyObj.translateZ(speed);
                orient = new THREE.Vector3(0, 0, 1)
                scenes.gameScene.camera.position.z += speed;
            } else if (e.key === 'a') {
                phyObj.translateX(speed);
                orient = new THREE.Vector3(1, 0, 0)
                scenes.gameScene.camera.position.x += speed;
            } else if (e.key === 's') {
                phyObj.translateZ(-speed);
                orient = new THREE.Vector3(0, 0, -1)
                scenes.gameScene.camera.position.z -= speed;
            } else if (e.key === 'd') {
                phyObj.translateX(-speed);
                orient = new THREE.Vector3(-1, 0, 0)
                scenes.gameScene.camera.position.x -= speed;
            }
            // 普通攻击
            else if (e.key === 'j' && currentChara.canShoot) {
                currentChara.attack(scenes.gameScene.scene);
            }
            // 攻击技能
            else if (e.key === ' ' && currentChara.blue === 100) {
                currentChara.attackSkill(scenes.gameScene.scene);
            } else if (e.key === 'g') {
                // 恢复
                phyObj.rotation.set(0, 0, 0);
                phyObj.position.set(0, 3.5, 0);
                phyObj.__dirtyRotation = true;
            }
            scenes.gameScene.camera.lookAt(phyObj.position);
            // console.log(cameras[stage].position);
            currentChara.orient = orient
            phyObj.children[0].lookAt(orient);
            phyObj.__dirtyPosition = true;
        });
        window.addEventListener('click', function (e) {

        })
        setInterval(function () {
            currentChara.canShoot = true;
        }, currentChara.shootInterval)
    }

    // 怪物相关
    function createMonster1(scene, list) {
        let monster = new Monster1();
        const manager = new THREE.LoadingManager;
        manager.onLoad = function () {
            monster.shooter = setInterval(function(){
                monster.longDistanceAttack(currentChara, scenes.gameScene.scene);
            },1000)
        };
        const loader = new THREE.ColladaLoader(manager);
        loader.load('assets/models/monster/monster.dae', function (result) {
            result.scene.scale.copy(monster.initScale);
            result.scene.position.copy(new THREE.Vector3(-5, -3, 0));
            // setup the mixer
            monster.mixer = new THREE.AnimationMixer(result.scene);
            monster.animationClip = result.animations[0];
            monster.clipAction = monster.mixer.clipAction(monster.animationClip).play();
            //monster.animationClip = monster.clipAction.getClip();
            // 更改播放速度
            monster.mixer.timeScale = 1;
            //addClipActionFolder(monster.clipAction);

            // 设置碰撞盒
            var geometry = new THREE.BoxGeometry(9, 6, 5);
            var physicBox = new Physijs.BoxMesh(geometry, Physijs.createMaterial(new THREE.MeshStandardMaterial({
                color: 'white', transparent: true, opacity: op, wireframe: isWF
            }), 1, 0), 10);
            let initPos = getRandomPos(50, 50, 0, currentChara.position);
            physicBox.position.copy(initPos);
            physicBox.add(result.scene);

            physicBox.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
                // this是当前监听的模型，other_object是与之碰撞的对象，relative_velocity是两个模型之间的速度力差，relative_rotation是两个模型旋转之间的差
                monster.action(scenes.gameScene.scene, this, other_object, currentChara, monsterList);
            });

            monster.mesh = physicBox;
            scene.add(physicBox);
            list.push(monster);
        });
    }
    function createMonster2(scene, list) {
        var textureLoader = new THREE.TextureLoader();
        var loader = new THREE.MD2Loader();
        let monster = new Monster2();
        loader.load('assets/models/ogre/ogro.md2', function (result) {
            var mat = new THREE.MeshStandardMaterial(
                { morphTargets: true,
                    color: 0xffffff,
                    metalness: 0,
                    map: textureLoader.load('assets/models/ogre/skins/skin.jpg')
                })

            var mesh = new THREE.Mesh(result, mat);
            mesh.scale.copy(monster.initScale);

            // // setup the mixer
            monster.mixer = new THREE.AnimationMixer(mesh);
            //console.log(result.animations)
            monster.animationClip = result.animations[1];
            monster.clipAction = monster.mixer.clipAction( monster.animationClip ).play();

            // 添加碰撞盒
            var size = getObjectSize(mesh);
            var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
            var physicBox = new Physijs.BoxMesh(geometry, Physijs.createMaterial(new THREE.MeshStandardMaterial({
                color: 'white', transparent: true, opacity: op, wireframe: isWF
            }), 1, 0), 10);
            let initPos = getRandomPos(50, 50, 3, currentChara.position);
            physicBox.position.copy(initPos);
            physicBox.add(mesh);
            physicBox.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
                // this是当前监听的模型，other_object是与之碰撞的对象，relative_velocity是两个模型之间的速度力差，relative_rotation是两个模型旋转之间的差
                monster.action(scenes.gameScene.scene, this, other_object, currentChara, monsterList);
            });

            monster.mesh = physicBox;
            scene.add(physicBox)
            list.push(monster);
        });

        function enableControls(geometry) {
            var gui = new dat.GUI();
            var mixerFolder = gui.addFolder("AnimationMixer")
            mixerFolder.add(mixerControls, "time").listen()
            mixerFolder.add(mixerControls, "timeScale", 0, 5).onChange(function (timeScale) {mixer.timeScale = timeScale});
            mixerFolder.add(mixerControls, "stopAllAction").listen()

            controls1 = addClipActionFolder("ClipAction 1", gui, clipAction1, animationClip1);
            controls2 = addClipActionFolder("ClipAction 2", gui, clipAction2, animationClip2);
            controls3 = addClipActionFolder("ClipAction 3", gui, clipAction3, animationClip3);

            var animationsArray = geometry.animations.map(function(e) {
                return e.name;
            });
            animationsArray.push("none")
            var animationMap = geometry.animations.reduce(function(res, el) {
                res[el.name] = el
                return res;
            }, {"none" : undefined});

            gui.add({animation: "none"}, "animation", animationsArray).onChange(function(selection) {
                clipAction1.stop();
                clipAction2.stop();
                clipAction3.stop();

                if (selectedClipAction) selectedClipAction.stop();
                if (selection != "none") {
                    selectedClipAction = mixer.clipAction( animationMap[selection] ).play();
                }
            });
        }
    }
    // 随机道具相关
    function createHeart(scene) {
        if (heartPhysic == null) {
            const manager = new THREE.LoadingManager;
            manager.onLoad = function () {
                console.log("heart加载完成");
            };
            loadObjFromObj('heart.mtl', 'assets/test/heart.obj', manager, function (heart) {
                heart.rotation.y = -Math.PI/2;
                let size = getObjectSize(heart);
                size.x = size.y;
                size.z = size.y;
                let boxPhysic = wrapMeshWithBoxPhysic(heart, 0.5,0,1,size);
                boxPhysic.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
                    if (other_object.name === 'chara') {
                        // 恢复2血
                        currentChara.healthIncrease(2);
                        scene.remove(this);
                    }
                });
                heartPhysic = boxPhysic.clone();
                boxPhysic.position.copy(getRandomPos(40, 40, 0, currentChara));
                scene.add(boxPhysic)
            })
        } else {
            let tempHeart = heartPhysic.clone();
            tempHeart.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
                if (other_object.name === 'chara') {
                    // 恢复2血
                    currentChara.healthIncrease(2);
                    scene.remove(this);
                }
            });
            tempHeart.position.copy(getRandomPos(40, 40, 0, currentChara));
            scene.add(tempHeart);
        }
    }
}

function createGroundAndWalls(scene) {
    var textureLoader = new THREE.TextureLoader();
    var cubeMaterial = new THREE.MeshStandardMaterial({
        emissive: 0xffffff,
        emissiveMap: textureLoader.load("assets/textures/emissive/lava.png"),
        normalMap: textureLoader.load("assets/textures/emissive/lava-normals.png"),
        metalnessMap: textureLoader.load("assets/textures/emissive/lava-smoothness.png"),
        metalness: 1,
        roughness: 0.4,
        normalScale: new THREE.Vector2(4, 4)
    });
    cubeMaterial.emissiveMap.wrapS = THREE.RepeatWrapping;
    cubeMaterial.emissiveMap.wrapT = THREE.RepeatWrapping;
    cubeMaterial.emissiveMap.repeat.set(3, 3);
    cubeMaterial.normalMap.wrapS = THREE.RepeatWrapping;
    cubeMaterial.normalMap.wrapT = THREE.RepeatWrapping;
    cubeMaterial.normalMap.repeat.set(3, 3);
    cubeMaterial.metalnessMap.wrapS = THREE.RepeatWrapping;
    cubeMaterial.metalnessMap.wrapT = THREE.RepeatWrapping;
    cubeMaterial.metalnessMap.repeat.set(3, 3);
    var ground_material = Physijs.createMaterial(cubeMaterial, .9, .3);

    var ground = new Physijs.BoxMesh(new THREE.BoxGeometry(100, 5, 100), ground_material, 0);
    ground.position.y -= 5;
    ground.castShadow = true;
    ground.receiveShadow = true;
    ground.name = 'ground';

    scene.add(ground);
}

function getRandomPos(w, l, h, target) {
    return new THREE.Vector3(Math.ceil(Math.random() * w), h, Math.ceil(Math.random() * w));
}

function towardsPlayer(monsters, player) {
    if (player !== null) {
        for (let monster in monsters) {
            let m = monsters[monster].mesh;
            // monsters[monster].children[0].lookAt(player.position);
            // monsters[monster].__dirtyRotation = true;
            // monsters[monster].__dirtyPosition = true;
            let delta = player.position.clone().sub(m.position);
            m.setLinearVelocity(delta.normalize().multiplyScalar(monsters[monster].speed));
            m.lookAt(new THREE.Vector3(player.position.x, m.position.y, player.position.z));
            // 更新怪物朝向
            monsters[monster].orient = delta.normalize();
            //m.rotation.y -= Math.PI / 2
            m.rotateY(-Math.PI / 2);
            // monsters[monster].__dirtyPosition = true;
            m.__dirtyRotation = true;
        }
    }
}

function removeMonsterFromList(list, monster) {
    for (let i = 0; i < list.length; i++) {
        if (list[i] === monster) {
            list.splice(i, 1);
            return;
        }
    }
}

function createArrow() {
    // 箭头
    let arrowShape = new THREE.Shape;
    arrowShape.moveTo(0, 0);
    arrowShape.lineTo(-2.5, 2.5)
    arrowShape.lineTo(0, -2);
    arrowShape.lineTo(2.5, 2.5);
    arrowShape.lineTo(0, 0);
    let options = {amount: 2, bevelThickness: 0, bevelSize: 1, bevelSegments: 3, curveSegments: 12, step: 1},
        arrowGeo = new THREE.ExtrudeGeometry(arrowShape, options),
        arrowMat = new THREE.MeshLambertMaterial({color: 16777215});
    let arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.rotation.x = 1 / 7 * Math.PI;
    arrow.scale.set(2, 2, 2);
    arrow.position.z += 12;

    let n = new TWEEN.Tween(arrow.position).to({y: 0}, 500),
        a = new TWEEN.Tween(arrow.position).to({y: 2}, 500);
    n.chain(a);
    a.chain(n);
    n.start();
    return arrow;
}

function loading() {
    $('#loading').show();
}

function loaded() {
    $('#loading').fadeOut();
}