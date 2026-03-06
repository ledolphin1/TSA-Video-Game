import * as Phaser from 'phaser';
//import init functions
import create_init from './Functions/create_init.js';
import constructor_init from './Functions/constructor_init.js';
import preload_init from './Functions/preload_init.js';
export default class BossScene extends Phaser.Scene {
  constructor() {
    super({ key: 'boss' });
    constructor_init.call(this)
  }

  preload() {
    preload_init.call(this)
    this.load.tilemapTiledJSON('boss_level', 'Assets/Map/boss.tmj');
    this.load.image("bossbg", "Assets/bossbg.png")
  }

  create() {

    this.add.image(160, 220, "bossbg");
    console.log("boss scene created");
    
    const map = this.make.tilemap({
      key: "boss_level"
    })
    create_init.call(this, map)

    // --- Create Enemy Group ---
    this.enemies = this.physics.add.group(); //  group for enemies

    // Spawn multiple enemies

    this.spawnEnemy(241, 296);


    this.physics.add.collider(this.enemies, this.ground);



    // --- Enemy Projectiles ---
    this.enemyProjectiles = this.physics.add.group();

    this.physics.add.collider(this.enemyProjectiles, this.ground, (proj) => {
      proj.destroy();
    });

    this.physics.add.overlap(this.player, this.enemyProjectiles, (player, proj) => {
      this.handleEnemyOverlap(player, proj);
      if (this.isInvincible) return;
      proj.destroy();
    });



    this.physics.add.overlap(this.playerProjectiles, this.enemies, (proj, enemy) => {
      proj.destroy();
      enemy.hp -= this.projectileDamage;
      console.log(`Enemy HP: ${enemy.hp}`); // Debug: See HP go down

      if (enemy.hp <= 0) {
        enemy.destroy();
      } else {
        // Flash to show hit
        enemy.setTintFill(0xffffff);
        this.time.delayedCall(100, () => {
          if (enemy.active) enemy.clearTint();
        });
      }
    });

    // --- Player vs Enemy Collision ---
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      this.handleEnemyOverlap(player, enemy);
    });

    this.player.x = 60;
    this.player.y = 200;


  }

 

  update(time, delta) {
    if (this.playerIsDead) return; // prevent movement while dead
    if (this.isKnockedBack) return; // prevent movement while applying knockback force
    if (this.projectileOnCooldown) {
      const elapsed = time - this.projectileCooldownStart;
      const progress = Phaser.Math.Clamp(elapsed / this.projectileCooldown, 0, 1);

      this.drawCooldown(progress);

      if (progress >= 1) {
        this.projectileOnCooldown = false;
      }
    }


    // Update Enemies
    this.enemies.children.iterate((enemy) => {
      this.updateEnemy(time, enemy);
    });

    //switched onGround to a property (just in case)
    this.onGround = this.player.body.blocked.down;
    if (this.onGround) {
      this.isJumping = false
      this.lastGroundedTime = time;
    }
    if (this.player.body.velocity.y > 0 && !this.isAttacking) {
      this.playerVisual.play("player_falling", true)
    }
    // Attack Input
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking && time > this.lastAttackEndTime + 10) {
      this.performAttack();
    }
    //Pause Input
    if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
      this.scene.pause()
      this.scene.launch("Pause", { returnScene: this.scene.key });
    }

    // Ranged Attack Input
    if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
      if (!this.projectileOnCooldown) {
        this.fireProjectile(time);
      }

    }


    if (this.isAttacking) return;

    // Left/Right Movement

    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      if (this.onGround) {
        this.playerVisual.play("player_moving", true)
      }
      this.player.setVelocityX(-150);



    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      if (this.onGround) {
        this.playerVisual.play("player_moving", true)
      }
      this.player.setVelocityX(150);

    } else {
      this.player.setVelocityX(0);
      if (this.onGround) {
        this.playerVisual.setTexture("player_still")
      }
    }

    // Jumping
    if (this.cursors.up.isDown && (this.onGround || (time - this.lastGroundedTime < 100))) {
      this.player.setVelocityY(-300);
      this.lastGroundedTime = 0;
      this.isJumping = true;
      this.playerVisual.play("player_jump_start", true);
    }

    // Variable jump height: cut velocity when button is released
    if (Phaser.Input.Keyboard.JustUp(this.cursors.up) && this.player.body.velocity.y < 0) {
      this.player.setVelocityY(this.player.body.velocity.y * 0.5);
    }

    // Update Coordinate Display
    this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);
  }


  spawnEnemy(x, y) {
    const enemy = this.enemies.create(x, y, 'enemySprite');
    const scale = 4; //temp scale for fake boss
    enemy.setScale(scale);

    enemy.hp = 20; // Enemy Health
    enemy.canShoot = true; // BOSS SHOOTS
    enemy.lastShotTime = 0;
    enemy.isKnockedBack = false;
    enemy.hitCooldown = false;
    enemy.play("enemy_moving");
    enemy.flipX = true;

    // Auto-center hitbox
    const eWidth = this.enemyHitbox.width;
    const eHeight = this.enemyHitbox.height;
    const eOffsetX = (enemy.width - eWidth) / 2;
    const eOffsetY = (enemy.height - eHeight); // Align to bottom

    enemy.body.setSize(eWidth, eHeight);
    enemy.body.setOffset(eOffsetX, eOffsetY);
    enemy.body.debugBodyColor = 0xff0000;

    enemy.setCollideWorldBounds(true);
    enemy.setVelocityX(50); // Start moving right
  }




  enemyProjectile(time, enemy) {
    this.lastFiredTime = time;

    for (let i = 0; i < 5; i++) {
      if (!enemy.active) return;
      this.time.delayedCall(i * 200, () => {
        if (!enemy.active) return;
        const proj = this.add.rectangle(enemy.body.center.x, enemy.body.center.y, 10, 10, 0xff0000);
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
  resetEnemies() {
    //skip function on purpose (useless function call) This is not a real function don't put anything in it.
  }
  updateEnemy(time, enemy) {
    if (!enemy.body) return;
    if (enemy.isKnockedBack) return;

    // Shooting Logic
    if (enemy.canShoot && time > enemy.lastShotTime + 2000) {
      this.enemyProjectile(time, enemy);
      enemy.lastShotTime = time;
    }

    // wall detection
    if (enemy.body.blocked.right) {
      enemy.setVelocityX(-50);
      enemy.flipX = false;
    } else if (enemy.body.blocked.left) {
      enemy.setVelocityX(50);
      enemy.flipX = true;
    }

    // Cliff Detection
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
}
