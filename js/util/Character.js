chara = function() {
    this.mesh = null;
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
}

Rem = function () {
    chara.call(this);
    createHammer(this);
    this.uniqueWeapon = null;
    this.name = 'Rem';
    this.initPos = new THREE.Vector3(0, -30, 0);
    this.initScale = new THREE.Vector3(10, 10, 10);
    this.initRot = new THREE.Vector3(1/7 *Math.PI, 0, 0);
    this.physicScale = new THREE.Vector3(1, 1, 1);
    this.obj = 'assets/test/rem.obj';
    this.mtl = 'rem.mtl';
    this.speed = 0.5
    this.damage = 2;
    this.uwDamage = 8;
    this.blood = 10;
    this.health = this.blood;
    this.intro = '<p>雷姆</p><p>技能：流星锤</p><p>效果：发射出巨大流星锤，造成大量伤害</p>';
    this.shootInterval = 300; // 普攻间隔，毫秒
    this.attack = function (scene) {
        let bullet = new Physijs.SphereMesh(new THREE.SphereGeometry(0.5, 10),
            Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 'red'})), 1);
        bullet.position.copy(this.physicMesh.position);
        // 调整发射位置
        bullet.position.add(this.orient);
        bullet.name = 'bullet';
        bullet.damage = this.damage;
        bullet.isRemove = false;
        scene.add(bullet);
        bullet.setLinearVelocity(this.orient.clone().multiplyScalar(100));
        // 防止连射
        this.canShoot = false;
        setTimeout(function () {
            // 会报错，暂时不影响
            if (!bullet.isRemove) {
                scene.remove(bullet);
            }
        }, 1000);
    }
    this.attackSkill = function (scene) {
        if (this.uniqueWeapon != null) {
            let uw = this.uniqueWeapon.clone();
            uw.scale.set(.05, .05, .05);
            uw.position.copy(this.physicMesh.position);
            uw.position.add(this.orient.clone().multiplyScalar(5));
            uw.position.y += 2
            uw.name = 'hammer';
            uw.damage = this.uwDamage;
            uw.isRemove = false;
            scene.add(uw);
            this.blueDecrease(100);
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
    this.name = 'Mage';
    this.initPos = new THREE.Vector3(50, -30, 0);
    this.initScale = new THREE.Vector3(10, 10, 10);
    this.initRot = new THREE.Vector3(1/7 *Math.PI, -1/10 *Math.PI, 0);
    this.physicScale = new THREE.Vector3(1.2, 1.2, 1.2);
    this.obj = 'assets/test/knight.obj';
    this.mtl = 'knight.mtl';
    this.speed = 1.1;
    this.damage = 2;
    this.blood = 8;
    this.health = this.blood;
    this.intro = '<p>战士</p><p>技能：流星锤</p><p>效果：发射出巨大流星锤，造成大量伤害</p>';
    this.shootInterval = 300;
    this.attack = function (scene) {
        let bullet = new Physijs.SphereMesh(new THREE.SphereGeometry(0.5, 10),
            Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 'red'})), 1);
        bullet.position.copy(this.physicMesh.position);
        // 调整发射位置
        bullet.position.add(this.orient);
        bullet.name = 'bullet';
        bullet.damage = this.damage;
        bullet.isRemove = false;
        scene.add(bullet);
        bullet.setLinearVelocity(this.orient.clone().multiplyScalar(100));
        // 防止连射
        this.canShoot = false;
        setTimeout(function () {
            // 会报错，暂时不影响
            if (!bullet.isRemove) {
                scene.remove(bullet);
            }
        }, 1000);
    }
}

Fox = function () {
    chara.call(this);
    this.name = 'Mage';
    this.initPos = new THREE.Vector3(-50, -30, 0);
    this.initScale = new THREE.Vector3(5, 5, 5);
    this.initRot = new THREE.Vector3(1/7 *Math.PI, 1/10 *Math.PI, 0);
    this.physicScale = new THREE.Vector3(1.2, 1.2, 1.2);
    this.obj = 'assets/test/fox.obj';
    this.mtl = 'fox.mtl';
    this.speed = 1.1;
    this.damage = 2;
    this.blood = 8;
    this.health = this.blood;
    this.intro = '<p>狐狸</p><p>技能：流星锤</p><p>效果：发射出巨大流星锤，造成大量伤害</p>';
    this.shootInterval = 300;
    this.attack = function (scene) {
        let bullet = new Physijs.SphereMesh(new THREE.SphereGeometry(0.5, 10),
            Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 'red'})), 1);
        bullet.position.copy(this.physicMesh.position);
        // 调整发射位置
        bullet.position.add(this.orient);
        bullet.name = 'bullet';
        bullet.damage = this.damage;
        bullet.isRemove = false;
        scene.add(bullet);
        bullet.setLinearVelocity(this.orient.clone().multiplyScalar(100));
        // 防止连射
        this.canShoot = false;
        setTimeout(function () {
            // 会报错，暂时不影响
            if (!bullet.isRemove) {
                scene.remove(bullet);
            }
        }, 1000);
    }
}

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