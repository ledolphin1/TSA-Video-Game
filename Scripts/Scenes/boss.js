import * as Phaser from "phaser";
import constructor_init from "./Functions/constructor_init.js";
import preload_init from "./Functions/preload_init.js";
import create_init from "./Functions/create_init.js";
import { customEmitter } from "./events.js";
import { playerData } from "./playerdata.js";
export default class BossScene extends Phaser.Scene {
  constructor() {
    super({ key: "boss" });

    constructor_init.call(this);
    this._bossTransitioned = false;
    this.freeze = false;
  }

  preload() {
    customEmitter.emit("SNAKEBOSS_BEGIN")
    preload_init.call(this);
    this.load.spritesheet('boss_move_sheet', "public/assets/AI_Sprite_Movement.png", {
      frameWidth: 49,
      frameHeight: 61
    })
    this.load.image("bossbg", "public/assets/bossbg.png");
    this.load.image("boss_still", "public/assets/AI_Sprite_fstill.png");
    this.load.tilemapTiledJSON("boss_level", "public/assets/Map/boss.tmj");
  }

  create() {
    this.killKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)
    this._bossTransitioned = false;
    this.add.image(160, 220, "bossbg");
    this.anims.create({
            key: "boss_twist",
            frames: this.anims.generateFrameNumbers("boss_move_sheet", {
                start: 0,
                end: 2
            }),
            frameRate: 5,
            repeat: 0,
            hideOnComplete: false
        })
    console.log("boss scene created");
    const map = this.make.tilemap({ key: "boss_level" });
    create_init.call(this, map,1) 
    
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).on("down", () => {
      console.log(this.enemy.x,"enemyx")
      console.log(this.enemy.y,"enemyy")
      playerData.transitionX= this.player.x;
      playerData.transitionY= this.player.y;
    this.scene.start("bt1");

    });
 
    
    this.cameras.main.setScroll(0, 200);
    //Create Enemy Group
    this.enemies = this.physics.add.group();

    this.spawnEnemy(241, 260);
    this._buildEnemyHpBar();

    this.physics.add.collider(this.enemies, this.ground);

    //Enemy Projectiles
    this.enemyProjectiles = this.physics.add.group();

    this.physics.add.collider(this.enemyProjectiles, this.ground, (proj) => {
      proj.destroy();
    });

    this.physics.add.overlap(this.player, this.enemyProjectiles, (player, proj) => {
      if (!this.scene.isActive()) return;
      this.handleEnemyOverlap(player, proj);
      if (this.isInvincible) return;
      proj.destroy();
    });
     this.physics.add.overlap(this.playerProjectiles, this.enemyProjectiles, (pproj, proj) => {
      if (proj && proj.active) {
        console.log("destroy enemy projs")
        proj.destroy();
      }
    });
    


    //Player vs Enemy Collision
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (this.freeze) return;
      if (!this.scene.isActive()) return;
      this.handleEnemyOverlap(player, enemy);
    });

    this.player.x = 60;
    this.player.y = 200;
  }


  update(time, delta) {
    if (this.freeze){
      this.boss_to_center(time,delta)
      return;
    }
    if (this.projectileOnCooldown) {
      const elapsed = time - this.projectileCooldownStart;
      const progress = Phaser.Math.Clamp(elapsed / this.projectileCooldown, 0, 1);
      this.drawCooldown(progress);
      if (progress >= 1) {
        this.projectileOnCooldown = false;
      }
    }

    if (this.playerIsDead) return;
    if (this.isKnockedBack) return;

    this.enemies.children.iterate((enemy) => {
      this.updateEnemy(time, enemy);
    });

    this.onGround = this.player.body.blocked.down;
    if (this.onGround) {
      this.isJumping = false;
      this.lastGroundedTime = time;
    }
    if (this.player.body.velocity.y > 0 && !this.isAttacking) {
      this.playerVisual.play("player_falling", true);
    }

    
    if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
      this.scene.pause();
      this.scene.launch("Pause", { returnScene: this.scene.key });
    }
    if (Phaser.Input.Keyboard.JustDown(this.killKey)) {
      console.log("i am pressed bro")
      console.log(this.enemy.hp)
      this.enemy.hp = 0;
      this._updateEnemyHpBar(this.enemy.hp);
    }
    if (this.isAttacking) return;
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking && time > this.lastAttackEndTime + 10) {
      this.performAttack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
      if (!this.projectileOnCooldown) {
        this.waveProj(time);
      }
    }


    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      if (this.onGround) {
        this.playerVisual.play("player_moving", true);
      }
      this.player.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      if (this.onGround) {
        this.playerVisual.play("player_moving", true);
      }
      this.player.setVelocityX(150);
    } else {
      this.player.setVelocityX(0);
      if (this.onGround) {
        this.playerVisual.setTexture("player_still");
      }
    }

    if (this.cursors.up.isDown && (this.onGround || (time - this.lastGroundedTime < 100))) {
      this.player.setVelocityY(-300);
      this.lastGroundedTime = 0;
      this.isJumping = true;
      this.playerVisual.play("player_jump_start", true);
    }

    if (Phaser.Input.Keyboard.JustUp(this.cursors.up) && this.player.body.velocity.y < 0) {
      this.player.setVelocityY(this.player.body.velocity.y * 0.5);
    }

    this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);
  }

  performAttack() {
    this.isJumping = false;
    this.isAttacking = true;
    this.player.setVelocityX(0);
    this.player.setVelocityY(0);
    this.player.body.allowGravity = false;

    this.time.delayedCall(1, () => {
      this.updatePlayerHitbox();
    });

    const offsetX = this.player.flipX ? -20 : 20;
    const startX = this.player.x + offsetX;
    const startY = this.player.y;

    const attackHitbox = this.physics.add.sprite(startX, startY, null);
    attackHitbox.body.setSize(30, 25);
    attackHitbox.setVisible(false);
    attackHitbox.body.allowGravity = false;
    attackHitbox.body.debugBodyColor = 0xffff00;
    this.playerVisual.play("player_attack", true);

    this.physics.add.overlap(attackHitbox, this.enemyProjectiles, (hitbox, proj) => {
      if (proj && proj.active) {
        proj.destroy();
      }
    });
   

    this.physics.add.overlap(attackHitbox, this.enemies, (hitbox, enemy) => {
      if (!this.scene.isActive()) return;
      if (enemy.hitCooldown) return;
      enemy.hitCooldown = true;

      this.playerVisual.play("player_attack", true);

      enemy.hp -= this.slashDamage;
      this._updateEnemyHpBar(enemy.hp);

      if (enemy.hp <= 0) {
        customEmitter.emit("stage_1_defeat")
        this.boss_to_center_one_call(enemy)
        this.freeze = true;
        return;
      }

      enemy.setTintFill(0xffffff);

      enemy.isKnockedBack = true;
      const kbDir = this.player.flipX ? -1 : 1;
      enemy.setVelocity(kbDir * this.knockbackSpeedX, -this.knockbackSpeedY);

      this.physics.world.pause();
      this.anims.pauseAll();

      setTimeout(() => {
        this.physics.world.resume();
        this.anims.resumeAll();
      }, 100);

      setTimeout(() => {
        if (enemy.active) {
          enemy.clearTint();
          enemy.isKnockedBack = false;
          enemy.hitCooldown = false;

          const recoverDir = (this.player.x < enemy.x) ? -1 : 1;
          enemy.setVelocityX(recoverDir * 50);
          enemy.flipX = (recoverDir === 1);
        }
      }, 400);
    });

    this.time.delayedCall(100, () => {
      attackHitbox.destroy();
    });

    this.time.delayedCall(250, () => {
      this.isAttacking = false;
      this.lastAttackEndTime = this.time.now;
      this.player.body.allowGravity = true;
      this.updatePlayerHitbox();
    });
  }

  spawnEnemy(x, y) {
    this.enemy = this.enemies.create(x, y, "boss_twist");
    const scale = 1;
    this.physics.add.collider(this.enemy, this.ground);
    this.enemy.setScale(scale);
    
    this.enemy.hp = 20;
    this.enemy.canShoot = true;
    this.enemy.lastShotTime = 0;
    this.enemy.isKnockedBack = false;
    this.enemy.hitCooldown = false;
    this.enemy.play("boss_twist");
    this.enemy.flipX = true;

    const eWidth = 49;
    const eHeight = 61 - 14;
    const eOffsetX = (this.enemy.width - eWidth) / 2;
    const eOffsetY = (this.enemy.height - eHeight);

    this.enemy.body.setSize(eWidth, eHeight);
    this.enemy.body.setOffset(eOffsetX, eOffsetY);
    this.enemy.body.debugBodyColor = 0xff0000;

    this.enemy.setCollideWorldBounds(true);
    this.enemy.setVelocityX(50);
  }



  enemyProjectile(time, enemy) {
    this.lastFiredTime = time;

    for (let i = 0; i < 5; i++) {
      if (!enemy.active) return;
      this.time.delayedCall(i * 200, () => {
        if (!enemy.active) return;
        const proj = this.add.rectangle(enemy.body.center.x, enemy.body.center.y - 7, 7, 7, 0xff0000);
        this.physics.add.existing(proj);
        this.enemyProjectiles.add(proj);

        proj.body.allowGravity = false;

        this.physics.moveTo(proj, this.player.x, this.player.y, 100);

        this.time.delayedCall(3000, () => {
          if (proj.active) proj.destroy();
        });
      });
    }
  }

  updateEnemy(time, enemy) {
    if (!enemy.body) return;
    if (enemy.isKnockedBack) return;

    if (enemy.canShoot && time > enemy.lastShotTime + 2000) {
      this.enemyProjectile(time, enemy);
      enemy.lastShotTime = time;
    }
    if (enemy.body.blocked.right) {
      enemy.setVelocityX(-50);
      enemy.flipX = false;
      enemy.play("boss_twist")
    } else if (enemy.body.blocked.left) {
      enemy.setVelocityX(50);
      enemy.flipX = true;
      enemy.play("boss_twist")
    }

    if (enemy.body.blocked.down) {
      const isMovingRight = enemy.body.velocity.x > 0;
      const xOffset = isMovingRight ? enemy.body.width + 5 : -5;
      const checkX = enemy.body.x + xOffset;
      const checkY = enemy.body.bottom + 2;

      const tile = this.ground.getTileAtWorldXY(checkX, checkY);

      if (!tile || tile.index === -1) {
        if (isMovingRight) {
          enemy.setVelocityX(-50);
          enemy.flipX = false;
        } else {
          enemy.setVelocityX(50);
          enemy.flipX = true;
        }
      }
    }
  }
  resetEnemies(){
    //do nothing just a blank function to call don"t keep anything in here.
  }
  _buildEnemyHpBar() {
    const bw = 120, bh = 8, bx = 100, by = 6;
    this.enemyHpBarBg   = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.enemyHpBarFill = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.enemyHpLabel   = this.add.text(160, 8, "SNAKE BOSS", { fontSize: "8px", color: "#ffffff" })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001);

    // Draw initial full bar
    this.enemyHpBarBg.lineStyle(1, 0xff0000);
    this.enemyHpBarBg.strokeRect(bx, by, bw, bh);
    this.enemyHpBarFill.fillStyle(0xdd0000);
    this.enemyHpBarFill.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
  }

  _updateEnemyHpBar(currentHp) {
    const enemy = this.enemies.getFirstAlive();
    const maxHp = enemy ? 20 : 20; // snake always starts at 20
    const pct   = Phaser.Math.Clamp(currentHp / 20, 0, 1);
    const bw = 120, bh = 8, bx = 100, by = 6;

    this.enemyHpBarBg.clear();
    this.enemyHpBarFill.clear();

    this.enemyHpBarBg.lineStyle(1, 0xff0000);
    this.enemyHpBarBg.strokeRect(bx, by, bw, bh);

    this.enemyHpBarFill.fillStyle(0xdd0000);
    this.enemyHpBarFill.fillRect(bx + 1, by + 1, (bw - 2) * pct, bh - 2);
  }

  _onBossDefeated() {
    if (this._bossTransitioned) return;
    this._bossTransitioned = true;

    this.time.delayedCall(1000, () => {
      try { this.music.stop(); } catch (e) {}
      this.scene.start("bt1");
      console.log(this.enemy.x,"enemyx")
      console.log(this.enemy.y,"enemyy")
      playerData.transitionX= this.player.x;
      playerData.transitionY= this.player.y;
    });
  }
  respawnPlayer() {
    this.health = this.maxHealth;
    this.drawHealthBar();
    this.playerIsDead = false;
    this.isInvincible = false;
    // Reset Player Position and Physics
    this.playerVisual.clearTint();
    this.playerVisual.setTexture("player_still"); // Reset animation to idle
    this.player.enableBody(true, 79, 232, true, false); // Reset to start pos, keep hidden
    this.playerVisual.setAlpha(1);
    this.player.setVelocity(0, 0);
    this.lastFiredTime = 0;
    this.isAttacking = false;
  }
  boss_to_center(time,delta){
    if (Math.round(this.enemy.x) == 162){
      this.enemy.setTexture("boss_still")
      console.log("yes sir i happened")
      this.enemy.body.setVelocityX(0);
      this._onBossDefeated();
      return;
    }
    if (this.playerIsDead) return;
    if (this.isKnockedBack) return;

   
    this.onGround = this.player.body.blocked.down;
    if (this.onGround) {
      this.isJumping = false;
      this.lastGroundedTime = time;
    }
    if (this.player.body.velocity.y > 0 && !this.isAttacking) {
      this.playerVisual.play("player_falling", true);
    }

    
    if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
      this.scene.pause();
      this.scene.launch("Pause", { returnScene: this.scene.key });
    }

    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      if (this.onGround) {
        this.playerVisual.play("player_moving", true);
      }
      this.player.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      if (this.onGround) {
        this.playerVisual.play("player_moving", true);
      }
      this.player.setVelocityX(150);
    } else {
      this.player.setVelocityX(0);
      if (this.onGround) {
        this.playerVisual.setTexture("player_still");
      }
    }

    if (this.cursors.up.isDown && (this.onGround || (time - this.lastGroundedTime < 100))) {
      this.player.setVelocityY(-300);
      this.lastGroundedTime = 0;
      this.isJumping = true;
      this.playerVisual.play("player_jump_start", true);
    }

    if (Phaser.Input.Keyboard.JustUp(this.cursors.up) && this.player.body.velocity.y < 0) {
      this.player.setVelocityY(this.player.body.velocity.y * 0.5);
    }

    this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);
  
  }
  boss_to_center_one_call(enemy){
    this.enemyProjectiles.clear(true,true)
    if (enemy.x > 162){
      if (enemy.body.velocity.x == 50){
        enemy.flipX = false;
        enemy.play("boss_twist")
      }
      enemy.body.setVelocityX(-50)
    } else {
      if (enemy.body.velocity.x == -50){
        enemy.flipX = true;
        enemy.play("boss_twist")
      }
      enemy.body.setVelocityX(50)
    }
  }
   projectileEnemyCollisionHandle(projectile,enemy,dmg){
      if (!this.scene.isActive()) return;
      enemy.hp -= dmg;
      console.log(enemy.hp)
      
      this._updateEnemyHpBar(enemy.hp);
      if (enemy.hp <= 0) {
        customEmitter.emit("stage_1_defeat")
        this.boss_to_center_one_call(enemy)
        this.freeze = true;
        return;
      } else {
      
        // Flash white
        enemy.setTintFill(0xffffff);

        enemy.isKnockedBack = true;
        // projectile direction
        const kbDir = (projectile.body.velocity.x > 0) ? 1 : -1;
        enemy.setVelocity(kbDir * this.knockbackSpeedX, -this.knockbackSpeedY);

        setTimeout(() => {
          if (enemy.active) {
            enemy.clearTint();
            enemy.isKnockedBack = false;
            enemy.hitCooldown = false;

            // Face Player and Move
            const recoverDir = (this.player.x < enemy.x) ? -1 : 1;
            enemy.setVelocityX(recoverDir * 50);
            enemy.flipX = (recoverDir === 1);
          }
        }, 400);
    }
  }
}