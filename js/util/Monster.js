Monster = function () {
    this.mixer = new THREE.AnimationMixer();
    this.clipAction = null;
    this.animationClip = null;
    this.mesh = null;
    this.orient = new THREE.Vector3(0,0,0);
    this.shooter = null;
    this.action = function (scene, self, other_object, currentChara, list) {
        if (other_object.name === 'bullet' || other_object.name === 'hammer') {
            // 伤害前血量
            scene.remove(other_object);
            other_object.isRemove = true;
            this.health -= other_object.damage;
            $('#blood-bar').show();
            $('#monster-name').html(this.name);
            // 伤害后血量
            $('#bar').width(this.health * 100 / this.blood + '%')
                .html(this.health + '/' + this.blood);
            if (this.health <= 0) {
                if (this.shooter != null) {
                    clearInterval(this.shooter);
                }
                scene.remove(self);
                removeMonsterFromList(list, this)
                $('#blood-bar').hide();
                $('#bar').width('100%');
                // 得分
                $('#score').html((currentChara.score += this.score))
                // 蓝量
                currentChara.blueIncrease(this.blue);
            }
        }
        // 给出伤害
        if (other_object.name === 'chara') {
            currentChara.healthDecrease(this.damage);
        }
    }
}

Monster1 = function () {
    Monster.call(this);
    this.blood = 10; // 总血量
    this.name = '恐怖怪兽';
    this.health = this.blood; // 当前血量
    this.damage = 1;
    this.score = 10; // 击杀得分
    this.speed = 5;
    this.blue = 30;
    this.initScale = new THREE.Vector3(0.005, 0.005, 0.005);
    this.longDistanceAttack = function (chara, scene) {
        let damage = this.damage
        let bullet = new Physijs.SphereMesh(new THREE.SphereGeometry(0.4, 10),
            Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 0x1E90FF})), 1);
        bullet.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
            if (other_object.name === 'chara') {
                chara.healthDecrease(damage);
                bullet.isRemove = true;
                scene.remove(bullet);
            }
        });
        bullet.position.copy(this.mesh.position);
        // 调整发射位置
        bullet.position.add(this.orient.clone().multiplyScalar(5));
        // bullet.position.y += 5;
        bullet.position.z += (Math.random() - 0.5) * 10;
        bullet.name = 'm_bullet';
        bullet.damage = this.damage;
        bullet.isRemove = false;
        scene.add(bullet);
        bullet.setLinearVelocity(this.orient.clone().multiplyScalar(30));
        setTimeout(function () {
            // 会报错，暂时不影响
            if (!bullet.isRemove) {
                scene.remove(bullet);
            }
        }, 1000);
    }
}

Monster2 = function () {
    Monster.call(this);
    this.blood = 20; // 总血量
    this.name = '巨人泰坦';
    this.health = this.blood; // 当前血量
    this.damage = 2;
    this.score = 20; // 击杀得分
    this.speed = 5;
    this.blue = 50;
    this.initScale = new THREE.Vector3(0.2, 0.2, 0.2);
}