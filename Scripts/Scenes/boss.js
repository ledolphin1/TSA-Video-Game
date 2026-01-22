import Phaser from 'phaser';
import { playerData } from './playerData';

export default class BossScene extends Phaser.Scene {
  constructor() {
    super({ key: 'boss' });

    {
      //Health & State
      this.maxHealth = 5;
      this.health = this.maxHealth;

      this.isInvincible = false;
      this.playerIsDead = false;
      this.isAttacking = false;
      this.isKnockedBack = false;

      //Combat
      this.slashDamage = 1;
      this.projectileDamage = 2;

      this.knockbackSpeedX = 100;
      this.knockbackSpeedY = 67;

      this.lastAttackEndTime = 0;

      //Hitboxes
      // Offsets are auto-calculated to center
      this.playerHitbox = {
        width: 10,
        height: 14
      };

      this.enemyHitbox = {
        width: 18.5,
        height: 9
      };

      //Visual Offsets
      // Positive X → shift sprite right
      // Positive Y → shift sprite down
      this.attackVisualOffset = {
        x: 9,
        y: -8
      };
    }

    this.projectileCooldown = 3000;
    this.projectileOnCooldown = false;
    this.projectileCooldownStart = 0;


  }

  preload() {
    this.load.image("basic_projectile", "/Assets/projectile.png")
    this.load.spritesheet('enemySprite', '/Assets/snake-mob.png', {
      frameWidth: 22,
      frameHeight: 11
    }); // enemy spritesheet

    this.load.spritesheet('player_attack_sheet', 'Assets/Main Character Attack.png', {
    this.load.spritesheet('player_wave_sheet', '/Assets/wave-sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    })



    /*this.load.spritesheet('hitAnim', 'Assets/hit.png', { // not created yet
      frameWidth: 64,
      frameHeight: 64
    });
  */
    this.load.image("frame", "Assets/ARCADE_BORDER.png")
    this.load.image("bossbg", "Assets/bossbg.png")
    this.load.image('player_still', 'Assets/Main Character Standing SSl.png'); //player image
    this.load.spritesheet("player_jumping", "Assets/Main Character Jump SS.png", {
      frameWidth: 16,
      frameHeight: 16
    })
    this.load.spritesheet('player_running', 'Assets/Main Character Running SS.png', {
      frameWidth: 16,
      frameHeight: 16
    })
    this.load.audio('background', 'Assets/audio/background_music_filler.mp3');
    this.load.tilemapTiledJSON('boss_level', 'Assets/Map/boss.tmj');
    this.load.image('tiles', 'Assets/Map/tileset.png');
    this.load.image("bossbg", "/Assets/bossbg.png")
   
    this.load.tilemapTiledJSON('boss_level', '/Assets/Map/boss.tmj');
    this.load.image('tiles', '/Assets/Map/tileset.png');

  }

  create() {
    console.log(playerData)

    this.add.image(160, 220, "bossbg");
    console.log("boss scene created");
    this.physics.world.roundPixels = false;
    //upload animations
    this.anims.create({
      key: "player_moving",
      frames: this.anims.generateFrameNumbers("player_running"),
      frameRate: 20,
      repeat: -1
    })
    this.anims.create({
      key: "enemy_moving",
      frames: this.anims.generateFrameNumbers("enemySprite"),
      frameRate: 20,
      repeat: -1
    })
    this.anims.create({
      key: "player_jump_start",
      frames: this.anims.generateFrameNumbers("player_jumping", {
        start: 0,
        end: 5
      }),
      frameRate: 10,
      repeat: 0,
      hideOnComplete: false
    })
    this.anims.create({
      key: "player_attack",
      frames: this.anims.generateFrameNumbers("player_attack_sheet", {
        start: 15,
        end: 18
      }),
      frameRate: 20,
      repeat: 0,
      hideOnComplete: false
    });
    this.anims.create({
      key: "player_wave",
      frames: this.anims.generateFrameNumbers("player_wave_sheet", {
        start: 0,
        end: 5
      }),
      frameRate: 20,
      repeat: 0,
      hideOnComplete: false
    });
    this.anims.create({
      key: "player_falling",
      frames: this.anims.generateFrameNumbers("player_jumping", {
        start: 6,
        end: 8
      }),
      frameRate: 10,
      repeat: 0,
      hideOnComplete: false
    })

    const map = this.make.tilemap({
      key: "boss_level"
    })
    const tileset = map.addTilesetImage("Tileset", "tiles")
    this.ground = map.createLayer("platforms", tileset)
    this.ground.setCollisionByExclusion([-1]);




    // --- Create Player ---
    this.player = this.physics.add.sprite(60, 296, "player_still");
    this.player.setVisible(false); // Hide physics body sprite

    // Create Visual Sprite (No Physics)
    this.playerVisual = this.add.sprite(60, 296, "player_still");
    this.playerVisual.setDepth(10); // Ensure it renders on top

    // Auto-center hitbox
    const pWidth = this.playerHitbox.width;
    const pHeight = this.playerHitbox.height;
    const pOffsetX = (this.player.width - pWidth) / 2;
    const pOffsetY = (this.player.height - pHeight); // Align to bottom
    // If you want pure center: (this.player.height - pHeight) / 2

    this.player.body.setSize(pWidth, pHeight);
    this.player.body.setOffset(pOffsetX, pOffsetY);

    this.physics.add.collider(this.player, this.ground)
    // this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setScroll(0, 200);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.setRoundPixels(false);
    // Force disable debug (just in case)
    // this.physics.world.drawDebug = false;
    // if (this.physics.world.debugGraphic) {
    //   this.physics.world.debugGraphic.setVisible(false);
    // }
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

    // --- Player Projectiles ---
    this.playerProjectiles = this.physics.add.group();

    this.physics.add.collider(this.playerProjectiles, this.ground, (proj) => {
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

    this.lastFiredTime = 0; // Initialize cooldown timer

    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();

    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.specialKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    // this.add.image(0,0,"frame").setOrigin(0,0).setScrollFactor(0).setDepth(1001)

    //cords for debug
    this.coordText = this.add.text(this.cameras.main.width - 10, this.cameras.main.height - 10, 'X: 0 Y: 0', {
      fontFamily: "./code_fonts/melodica.regular.otf",
      fontSize: "16px",
      fill: "#ffffff"
    });
    this.coordText.setOrigin(1, 1);
    this.coordText.setScrollFactor(0);
    this.coordText.setDepth(1000);

    //sidney asked for music
    const music = this.sound.add('background', {
      loop: true,
      volume: 0.65
    });

    //music.setDetune(-700); - I left it in just for you (i'm guessing its leo who added this) (yeah sidney told me to do it)
    music.play();
    this.player.x = 60;
    this.player.y = 200;
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

    this.cooldownRadius = 8;
    this.cooldownX = this.cameras.main.width - 15;
    this.cooldownY = 15;

    this.cooldownGraphic = this.add.graphics();
    this.cooldownGraphic.setScrollFactor(0);
    this.cooldownGraphic.setDepth(1000);
    this.cooldownGraphic.setVisible(false);

    this.healthBarWidth = 100;
    this.healthBarHeight = 10;
    this.healthBarX = 20; // distance from left
    this.healthBarY = 20; // distance from top

    this.healthBarBg = this.add.graphics();
    this.healthBarFill = this.add.graphics();

    this.healthBarBg.setScrollFactor(0);
    this.healthBarFill.setScrollFactor(0);
    this.healthBarBg.setDepth(1000);
    this.healthBarFill.setDepth(1000);

    this.drawHealthBar();

  }

  drawHealthBar() {
    const healthPercent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);

    this.healthBarBg.clear();
    this.healthBarFill.clear();

    this.healthBarBg.lineStyle(2, 0xffffff);
    this.healthBarBg.strokeRect(
      this.healthBarX,
      this.healthBarY,
      this.healthBarWidth,
      this.healthBarHeight
    );

    this.healthBarFill.fillStyle(0x00ff00);
    this.healthBarFill.fillRect(
      this.healthBarX + 2,
      this.healthBarY + 2,
      (this.healthBarWidth - 4) * healthPercent,
      this.healthBarHeight - 4
    );
  }


  drawCooldown(progress) {
    this.cooldownGraphic.clear();

    if (progress >= 1) {
      this.cooldownGraphic.setVisible(false);
      return;
    }

    this.cooldownGraphic.setVisible(true);

    this.cooldownGraphic.fillStyle(0x00ffff, 1);

    this.cooldownGraphic.beginPath();
    this.cooldownGraphic.moveTo(this.cooldownX, this.cooldownY);

    this.cooldownGraphic.arc(
      this.cooldownX,
      this.cooldownY,
      this.cooldownRadius,
      Phaser.Math.DegToRad(-90),
      Phaser.Math.DegToRad(-90 + 360 * (1 - progress)),
      false
    );

    this.cooldownGraphic.closePath();
    this.cooldownGraphic.fillPath();
  }

  update(time, delta) {
    if (this.projectileOnCooldown) {
      const elapsed = time - this.projectileCooldownStart;
      const progress = Phaser.Math.Clamp(elapsed / this.projectileCooldown, 0, 1);

      this.drawCooldown(progress);

      if (progress >= 1) {
        this.projectileOnCooldown = false;
      }
    }

    if (this.playerIsDead) return; // prevent movement while dead
    if (this.isKnockedBack) return; // prevent movement while applying knockback force

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
    if (Phaser.Input.Keyboard.JustDown(this.specialKey) && !this.isAttacking && time > this.lastAttackEndTime + 20) {
      this.waveAttack();
    }

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

  performAttack() {
    this.isJumping = false
    this.isAttacking = true;
    this.player.setVelocityX(0); // Stop horizontal movement
    this.player.setVelocityY(0); // Stop vertical movement
    this.player.body.allowGravity = false; // Disable gravity

    // Force immediate hitbox adjustment for the new animation frame
    this.time.delayedCall(1, () => {
      this.updatePlayerHitbox();
    });

    // Calculate hitbox position based on facing direction
    const offsetX = this.player.flipX ? -20 : 20; // Left or Right
    const startX = this.player.x + offsetX;
    const startY = this.player.y;
    // Create a temporary hitbox for the attack
    // Using a clear sprite or zone. For debug visibility we can use a small colored sprite or just a physics body.
    // We'll use a physics sprite without texture (invisible) but debug body visible.
    const attackHitbox = this.physics.add.sprite(startX, startY, null);
    attackHitbox.body.setSize(30, 25);
    attackHitbox.setVisible(false); // Invisible sprite
    attackHitbox.body.allowGravity = false;
    attackHitbox.body.debugBodyColor = 0xffff00; // Yellow for attack
    this.playerVisual.play("player_attack", true);

    //Check overlap with projectiles
    this.physics.add.overlap(attackHitbox, this.enemyProjectiles, (hitbox, proj) => {
      if (proj && proj.active) {
        proj.destroy();
      }
    });

    // Check overlap with enemies
    this.physics.add.overlap(attackHitbox, this.enemies, (hitbox, enemy) => {
      if (enemy.hitCooldown) return;
      enemy.hitCooldown = true;

      this.playerVisual.play("player_attack", true);


      enemy.hp -= this.slashDamage;

      if (enemy.hp <= 0) {
        enemy.destroy();
        this.physics.world.pause();
        this.anims.pauseAll();
        setTimeout(() => {
          this.physics.world.resume();
          this.anims.resumeAll();
        }, 100);
        return;
      }

      // Flash white
      enemy.setTintFill(0xffffff);

      // Apply Knockback
      enemy.isKnockedBack = true;
      const kbDir = this.player.flipX ? -1 : 1;
      enemy.setVelocity(kbDir * this.knockbackSpeedX, -this.knockbackSpeedY);

      // Hitstop effect
      this.physics.world.pause();
      this.anims.pauseAll();

      // Resume Game Loop after freeze
      setTimeout(() => {
        this.physics.world.resume();
        this.anims.resumeAll();
      }, 100);

      // Reset Enemy State
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
    });

    // Remove hitbox after short duration
    this.time.delayedCall(100, () => {
      attackHitbox.destroy();
    });

    // Reset attack state after fixed duration (independent of animation)
    this.time.delayedCall(250, () => {
      this.isAttacking = false;
      this.lastAttackEndTime = this.time.now;
      this.player.body.allowGravity = true; // Restore gravity
      this.updatePlayerHitbox(); // Reset hitbox for normal sprite
    });
  }
  waveAttack() {
    console.log("Special Attack had been performed:",this.specialWeapon)
    if (playerData.specialWeapon!= 1){
      return;
    }
    this.isJumping = false
    this.isAttacking = true;
    this.player.setVelocityX(0); // Stop horizontal movement
    this.player.setVelocityY(0); // Stop vertical movement
    this.player.body.allowGravity = false; // Disable gravity

    // Force immediate hitbox adjustment for the new animation frame
    this.time.delayedCall(1, () => {
      this.updatePlayerHitbox();
    });

    // Calculate hitbox position based on facing direction
    const offsetX = this.player.flipX ? -40 : 40; // Left or Right
    const startX = this.player.x + offsetX;
    const startY = this.player.y;
    // Create a temporary hitbox for the attack
    // Using a clear sprite or zone. For debug visibility we can use a small colored sprite or just a physics body.
    // We'll use a physics sprite without texture (invisible) but debug body visible.
    const attackHitbox = this.physics.add.sprite(startX, startY, null);
    attackHitbox.body.setSize(48, 34);
    attackHitbox.setVisible(false); // Invisible sprite
    attackHitbox.body.allowGravity = false;
    attackHitbox.body.debugBodyColor = 0xffff00; // Yellow for attack
    this.playerVisual.play("player_wave", true);
    
    //Check overlap with projectiles
    this.physics.add.overlap(attackHitbox, this.enemyProjectiles, (hitbox, proj) => {
      if (proj && proj.active) {
        proj.destroy();
      }
    });

    // Check overlap with enemies
    this.physics.add.overlap(attackHitbox, this.enemies, (hitbox, enemy) => {
      if (enemy.hitCooldown) return;
      enemy.hitCooldown = true;

      this.playerVisual.play("player_wave", true);
      

      enemy.hp -= this.slashDamage;

      if (enemy.hp <= 0) {
        enemy.destroy();
        this.physics.world.pause();
        this.anims.pauseAll();
        setTimeout(() => {
          this.physics.world.resume();
          this.anims.resumeAll();
        }, 100);
        return;
      }

      // Flash white
      enemy.setTintFill(0xffffff);

      // Apply Knockback
      enemy.isKnockedBack = true;
      const kbDir = this.player.flipX ? -1 : 1;
      enemy.setVelocity(kbDir * this.knockbackSpeedX + 6, -this.knockbackSpeedY + 3);

      // Hitstop effect
      this.physics.world.pause();
      this.anims.pauseAll();

      // Resume Game Loop after freeze
      setTimeout(() => {
        this.physics.world.resume();
        this.anims.resumeAll();
      }, 100);

      // Reset Enemy State
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
    });

    // Remove hitbox after short duration
    this.time.delayedCall(100, () => {
      attackHitbox.destroy();
    });

    // Reset attack state after fixed duration (independent of animation)
    this.time.delayedCall(250, () => {
      this.isAttacking = false;
      this.lastAttackEndTime = this.time.now;
      this.player.body.allowGravity = true; // Restore gravity
      this.updatePlayerHitbox(); // Reset hitbox for normal sprite
    });
  }

  updatePlayerHitbox() {
    if (!this.player || !this.player.body) return;

    const pWidth = this.playerHitbox.width;
    const pHeight = this.playerHitbox.height;

    // Recalculate offset based on CURRENT sprite dimensions
    const pOffsetX = (this.player.width - pWidth) / 2;
    // Align to center instead of bottom to handle varying sprite canvas sizes (16x16 vs 64x64)
    // +1 ensures we match the original 16x16 idle offset (which was 2px)
    const pOffsetY = ((this.player.height - pHeight) / 2) + 1;

    this.player.body.setSize(pWidth, pHeight);
    this.player.body.setOffset(pOffsetX, pOffsetY);
  }
 

  handleEnemyOverlap(player, enemy) {
    if (this.playerIsDead || this.isInvincible) return;
    if (enemy.isKnockedBack) return; // enemy cannot hurt player while stunned

    // Common Damage Logic
    this.health--;
    this.drawHealthBar();

    // Super Armor Case: attacking players don't freeze or get knocked back
    if (this.isAttacking) {
      this.isInvincible = true;
      if (this.health <= 0) {
        this.killPlayer();
      } else {
        this.flashPlayer();
      }
      return;
    }

    // Normal Case: Hitstop (Freezeframe) then Knockback
    this.physics.world.pause();
    this.anims.pauseAll();
    this.isInvincible = true; // Lock collisions during freeze

    // Use setTimeout to ignore engine time scale effectively
    setTimeout(() => {
      this.physics.world.resume();
      this.anims.resumeAll();

      if (this.health <= 0) {
        this.killPlayer();
      } else {
        // Apply Knockback
        this.isKnockedBack = true;

        const knockbackDirection = (this.player.x < enemy.x) ? -1 : 1;
        this.player.setVelocity(knockbackDirection * 100, -50);

        // Lock controls for short duration
        this.time.delayedCall(250, () => {
          this.isKnockedBack = false;
        });

        this.flashPlayer();
      }
    }, 150); // 150ms freeze duration
  }

  flashPlayer() {
    this.tweens.add({
      targets: this.playerVisual,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.playerVisual.alpha = 1;
        this.isInvincible = false;
      }
    });
  }

  killPlayer() {
    if (this.playerIsDead) return;
    this.playerIsDead = true;
    this.isJumping = false

    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0);
    this.player.body.enable = false;
    this.playerVisual.setTint(0xff0000); // Visual feedback for death

    this.time.delayedCall(100, () => {
      this.respawnPlayer();
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
    this.player.enableBody(true, 60, 200, true, false); // Reset to start pos, keep hidden
    this.playerVisual.setAlpha(1);
    this.player.setVelocity(0, 0);
    this.lastFiredTime = 0;
    this.isAttacking = false;
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

  fireProjectile(time) {
    this.projectileOnCooldown = true;
    this.projectileCooldownStart = time;

    this.lastFiredTime = time;
    const proj = this.add.sprite(this.player.x, this.player.y,"basic_projectile");
    this.physics.add.existing(proj);
    this.playerProjectiles.add(proj); // Use separate group!
    proj.flipX = this.player.flipX? true : false;
    proj.body.allowGravity = false;
    const velocity = this.player.flipX ? -400 : 400;
    proj.body.setVelocityX(velocity);

    // auto destroy
    this.time.delayedCall(2000, () => {
      if (proj.active) proj.destroy();
    });

    // Add collision with enemies
    this.physics.add.overlap(proj, this.enemies, (projectile, enemy) => {
      if (enemy.hitCooldown) {
        projectile.destroy();
        return;
      }
      enemy.hitCooldown = true;
      projectile.destroy();

      enemy.hp -= this.projectileDamage;

      if (enemy.hp <= 0) {
        enemy.destroy();
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
    });
    // hit wall
    this.physics.add.collider(proj, this.ground, () => {
      proj.destroy();
    });
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
