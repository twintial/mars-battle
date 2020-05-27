chara = function() {
    this.mesh = null;
    this.weapon = null;
    this.uniqueWeapon = null;
    this.physicMesh = null;
    this.orient = new THREE.Vector3(0,0,1);
    this.score = 0;
    this.canShoot = true;
    this.blue = 0;
    this.healthIncrease = function (num) {
        this.health +=num;
        if (this.health > this.blood) {
            this.health = this.blood;
        }
        $('#chara-bar').width(this.health * 100 / this.blood + '%')
            .html(this.health + '/' + this.blood);
    }
    this.healthDecrease = function (num) {
        this.health -= num;
        $('#chara-bar').width(this.health * 100 / this.blood + '%')
            .html(this.health + '/' + this.blood);
        if (this.health <= 0) {
            console.log('game over');
            gameOver();
        }
    }
    this.blueIncrease = function (num) {
        this.blue += num;
        if (this.blue > 100) {
            this.blue = 100;
        }
        $('#blue-bar').width(this.blue + '%')
            .html(this.blue);
    }
    this.blueDecrease = function (num) {
        this.blue -= num;
        if (this.blue < 0) {
            this.blue = 0;
        }
        $('#blue-bar').width(this.blue + '%')
            .html(this.blue);
    }
    this.attack = function (scene) {
        let weapon = this.weapon.clone();
        weapon.position.copy(this.physicMesh.position);
        // 调整发射位置
        weapon.position.add(this.orient);
        weapon.lookAt(this.orient.clone().multiplyScalar(10));
        weapon.__dirtyRotation = true;
        weapon.name = 'bullet';
        weapon.damage = this.damage;
        weapon.isRemove = false;
        scene.add(weapon);
        weapon.setLinearVelocity(this.orient.clone().multiplyScalar(100));
        // 防止连射
        this.canShoot = false;
        setTimeout(function () {
            // 会报错，暂时不影响
            if (!weapon.isRemove) {
                scene.remove(weapon);
            }
        }, 1000);
    }
}

Rem = function () {
    chara.call(this);
    createHammer(this);
    createWeapon(this, 'ice.mtl', 'assets/test/ice.obj', new THREE.Vector3(2, 2, 2));
    this.name = 'Rem';
    this.initPos = new THREE.Vector3(0, -30, 0);
    this.initScale = new THREE.Vector3(10, 10, 10);
    this.initRot = new THREE.Vector3(1/7 *Math.PI, 0, 0);
    this.physicScale = new THREE.Vector3(1, 1, 1);
    this.obj = 'assets/test/rem.obj';
    this.mtl = 'rem.mtl';
    this.speed = 0.6
    this.damage = 4;
    this.uwDamage = 8;
    this.blood = 10;
    this.health = this.blood;
    this.intro = '<p>雷姆</p><p>血量：10</p><p>攻击力：4</p><p>移动速度：0.6</p><p>技能：流星锤</p><p>效果：发射出巨大流星锤，造成大量伤害！</p>';
    this.shootInterval = 300; // 普攻间隔，毫秒
    this.uniqueSkill = function (scene) {
        if (this.uniqueWeapon != null) {
            // 清空蓝条
            this.blueDecrease(100);
            let uw = this.uniqueWeapon.clone();
            uw.scale.set(.05, .05, .05);
            uw.position.copy(this.physicMesh.position);
            uw.position.add(this.orient.clone().multiplyScalar(5));
            uw.position.y += 2
            uw.name = 'hammer';
            uw.damage = this.uwDamage;
            uw.isRemove = false;
            scene.add(uw);
            let orient = this.orient
            setTimeout(function () {
                if (!uw.isRemove) {
                    uw.setLinearVelocity(orient.clone().multiplyScalar(100));
                }
            }, 500)
            setTimeout(function () {
                // 会报错，暂时不影响
                if (!uw.isRemove) {
                    scene.remove(uw);
                }
            }, 2000);
        } else {
            console.log('error');
        }
    }
}

Knight = function () {
    chara.call(this);
    createWeapon(this, 'chop.mtl', 'assets/test/chop.obj', new THREE.Vector3(2, 2, 2));
    this.name = 'Knight';
    this.initPos = new THREE.Vector3(50, -30, 0);
    this.initScale = new THREE.Vector3(10, 10, 10);
    this.initRot = new THREE.Vector3(1/7 *Math.PI, -1/10 *Math.PI, 0);
    this.physicScale = new THREE.Vector3(1.2, 1.2, 1.2);
    this.obj = 'assets/test/knight.obj';
    this.mtl = 'knight.mtl';
    this.speed = 1;
    this.damage = 2;
    this.blood = 8;
    this.health = this.blood;
    this.intro = '<p>战士</p><p>血量：8</p><p>攻击力：2</p><p>移动速度：1</p><p>技能：狂暴</p><p>效果：一段时间内移动速度和攻击力大幅提升</p>';
    this.shootInterval = 250;
    this.uniqueSkill = function (scene) {
        // 清空蓝条
        this.blueDecrease(100);
        new TWEEN.Tween(this.physicMesh.scale).to({x: 2, y: 2, z:2}, 500).start();
        let that = this;
        that.speed += 0.2;
        that.damage *= 2;
        setTimeout(function () {
            new TWEEN.Tween(that.physicMesh.scale).to({x: 1.2, y: 1.2, z:1.2}, 500).start();
            that.speed -= 0.2;
            that.damage /= 2;
        }, 10000)
    }
}

Fox = function () {
    chara.call(this);
    // createStand(this);
    createWeapon(this, 'fox.mtl', 'assets/test/fox.obj', new THREE.Vector3(.2, .2, .2));
    this.name = 'Fox';
    this.initPos = new THREE.Vector3(-50, -30, 0);
    this.initScale = new THREE.Vector3(5, 5, 5);
    this.initRot = new THREE.Vector3(1/7 *Math.PI, 1/10 *Math.PI, 0);
    this.physicScale = new THREE.Vector3(1.2, 1.2, 1.2);
    this.obj = 'assets/test/fox.obj';
    this.mtl = 'fox.mtl';
    this.speed = 0.8;
    this.damage = 2;
    this.blood = 5;
    this.health = this.blood;
    this.intro = '<p>狐狸</p><p>血量：5</p><p>攻击力：2</p><p>移动速度：0.8</p><p>技能：替身</p><p>效果：在前方制造出替身人偶，可以吸引敌人并吸收一定的伤害</p>';
    this.shootInterval = 300;
    this.uniqueSkill = function (scene) {
        this.uniqueWeapon = this.physicMesh.clone();
        if (this.uniqueWeapon != null) {
            // 清空蓝条
            this.blueDecrease(100);
            let pm = this.physicMesh;
            let uw = pm.clone();
            uw.mass = 1e9;
            console.log(uw)
            console.log(pm)
            uw.name = 'fox_stand';
            uw.blood = 8;
            uw.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
                if (--uw.blood <= 0) {
                    scene.remove(uw);
                    pm.target = undefined;
                }
            });
            uw.position.copy(this.physicMesh.position);
            uw.position.add(this.orient.clone().multiplyScalar(5));
            scene.add(uw);
            pm.target = uw;
        } else {
            console.log('error');
        }
    }
}

// rem大招
createHammer = function(chara) {
    const manager = new THREE.LoadingManager;
    manager.onLoad = function () {
        console.log("hammer资源加载完成");
    };
    let fbx_loader = new THREE.FBXLoader(manager);
    fbx_loader.load('assets/test/hammer.FBX', function(object) {
        // object.scale.multiplyScalar(.1);    // 缩放模型大小
        chara.uniqueWeapon = wrapMeshWithBoxPhysic(object, 0, 0, 100, getObjectSize(object));
    });
}

createWeapon = function(chara, mtl, obj, scale) {
    const manager = new THREE.LoadingManager;
    manager.onLoad = function () {
        console.log("chop资源加载完成");
    };
    loadObjFromObj(mtl, obj, manager, function (object) {
        chara.weapon = wrapMeshWithBoxPhysic(object, 0, 0, 1, getObjectSize(object));
        chara.weapon.scale.copy(scale);
    })
}