
import * as Phaser from "phaser";
//import external functions
import create_init from "./Functions/create_init.js";
import activate_anims from "./Functions/activate_anims.js";
import constructor_init from "./Functions/constructor_init.js";
import preload_init from "./Functions/preload_init.js";
import performAttack from "./Functions/performAttack.js";
import { customEmitter } from "./events.js";
import { playerData } from "./playerdata.js";
export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    constructor_init.call(this);
  
    
  }
  
  preload() {
    customEmitter.emit("L1BEGIN")
    preload_init.call(this)
    this.load.spritesheet("chests", "public/assets/chests.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.tilemapTiledJSON("map", "public/assets/Map/firstlevel.tmj");
    this.load.image("spikes", "public/assets/Map/spikes.png");
    this.load.image("gate", "public/assets/gate.png");
    
  }
  create() {
    const map = this.make.tilemap({
      key: "map"
    })

    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).on("down", () => {
    this.scene.start("boss");
    });

    create_init.call(this, map);
    activate_anims.call(this);
     // --- Post-Update Sync (Fixes Lag/Blur) ---
    // Sync runs AFTER physics, ensuring visual matches actual body position for this frame
    this.events.on('postupdate', () => {
      if (this.playerVisual && this.player) {
        let vX = this.player.x;
        let vY = this.player.y;

        // Apply Visual Offsets when attacking
        if (this.playerVisual.texture.key === 'player_attack_sheet') {
          // Invert X offset if facing left
          if (this.player.flipX) {
            vX -= this.attackVisualOffset.x;
          } else {
            vX += this.attackVisualOffset.x;
          }
          vY += this.attackVisualOffset.y;
        }

        this.playerVisual.setPosition(vX, vY);
        this.playerVisual.setFlipX(this.player.flipX);


      }
    });
  
    this.performAttack = performAttack.bind(this);
    const spikeTileset = map.addTilesetImage("spikes", "spikes")
    const spikes = map.createLayer("spikes", spikeTileset)

    //gate logic
     this.gate = this.physics.add.sprite(145,179,"gate").setOrigin(0.5,1).setDepth(-5)
    this.gate.setImmovable(true);
    this.physics.add.collider(this.gate, this.ground);

    // Interaction Logic
    this.physics.add.overlap(this.player, this.gate, () => {
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            // Stop music before switching if needed
            this.sound.stopAll();
            this.scene.start("boss");
        }
    });
    
    // Create Enemy Group
    this.enemies = this.physics.add.group(); //  group for enemies
    
    //Create Spikes Collision
    spikes.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, spikes, this.handleSpikeOverlap, null, this);

    // Spawn multiple enemies
    this.enemySpawnPoints = [
      { x: 770, y: 870 },
      { x: 1150, y: 840 },
      { x: 1400, y: 820 },
      { x: 1500, y: 820 },
      { x: 2000, y: 580 },
      { x: 2100, y: 580 },
      { x: 1250, y: 568 },
      { x: 1610, y: 568 },
      { x: 1610, y: 568 },
      { x: 1200, y: 312 },
      { x: 805, y: 520 }
    ];

    this.enemySpawnPoints.forEach(point => {
      this.spawnEnemy(point.x, point.y);
    });

    this.physics.add.collider(this.enemies, this.ground);
    this.physics.add.collider(this.enemies, spikes, this.handleEnemySpike, null, this);

    // enemy projectiles
    this.projectiles = this.physics.add.group();

    this.physics.add.collider(this.projectiles, this.ground, (proj) => {
      proj.destroy();
    });

    this.physics.add.overlap(this.playerProjectiles, this.enemies, (proj, enemy) => {
      proj.destroy();
      enemy.destroy();
    });

    // player-enemy/projectile collision
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      this.handleEnemyOverlap(player, enemy);
    });
    this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => {
      this.handleEnemyOverlap(player, projectile);
      projectile.destroy();
    });

    // chests
    this.chests = this.physics.add.group();
    const chest = this.chests.create(2060, 584, "chests", 0); // Frame 0 = closed
    chest.body.setAllowGravity(false); // assuming chest stays in place
    // chest.setImmovable(true); 

    this.physics.add.overlap(this.player, this.chests, (player, chest) => {
      this.handleChestOverlap(player, chest);
    });

    //Skip Key for debug
    this.skipKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
 

  }

  update(time, delta) {
    if (this.playerIsDead) {
      this.resetEnemies();
      return;
    }; // prevent movement while dead
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
      this.updateEnemy(enemy);
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
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking && time > this.lastAttackEndTime + 10 && playerData.didJump) {
      customEmitter.emit("ATTACKED")
      this.performAttack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
      this.scene.pause()
      this.scene.launch("Pause", { returnScene: this.scene.key });
    }

    // Ranged Attack Input
    if (Phaser.Input.Keyboard.JustDown(this.fireKey) && !this.projectileOnCooldown && playerData.didAttack) {
      if (time > this.lastFiredTime + this.projectileCooldown) { // 3s cooldown
        this.fireProjectile(time);
        customEmitter.emit("LPFIRED")
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
      customEmitter.emit("JUMPED")
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

    

    if (this.skipKey.isDown) {
      playerData.didJump = true;
      playerData.didAttack = true;
      playerData.didMove = true;
      this.scene.start("boss");
      this.music.stop()
    }

  }


  handleEnemySpike(enemy, spike) {
    if (spike && spike.index !== -1) {
      enemy.destroy();
    }
  }

  handleSpikeOverlap(player, spike) {
    if (this.playerIsDead) return;
    // Check if we are really touching a spike tile (not empty space)
    if (spike && spike.index !== -1) {
      this.killPlayer();
      this.resetEnemies();
    }
  }


  resetEnemies() {
    this.enemies.clear(true, true); // Remove all children and destroy them
    this.enemySpawnPoints.forEach(point => {
      this.spawnEnemy(point.x, point.y);
    });
  }

  spawnEnemy(x, y) {
    const enemy = this.enemies.create(x, y, "enemySprite");
    enemy.hp = 2; // Enemy Health
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

  handleChestOverlap(player, chest) {

    chest.setFrame(1);
    chest.disableBody();
    const text = this.add.text(chest.x, chest.y - 20, "Special Unlocked! Press F to Use", { fontSize: "12px", fill: "#fff" });
    this.projectileCooldownStart = 0; 
    // Fade out text and destroy chest after delay
    this.time.delayedCall(2000, () => {
      text.destroy();
      chest.destroy();
    });
  }



  updateEnemy(enemy) {
    if (!enemy.body) return;
    if (enemy.isKnockedBack) return;

    // wall detection
    if (enemy.body.blocked.right) {
      enemy.setVelocityX(-50);
      enemy.flipX = false;
    } else if (enemy.body.blocked.left) {
      enemy.setVelocityX(50);
      enemy.flipX = true;
    }

    // cliff detection
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
