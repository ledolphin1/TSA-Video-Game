
import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });

    this.health = 3; // : player health
    this.isInvincible = false; // : track invulnerability
    this.playerIsDead = false; // : track if player is dead
    this.isAttacking = false; // track attack state
    // --- Hitbox Settings ---
    // Adjustable values for Player (Offsets are auto-calculated to center)
    this.playerHitbox = {
      width: 10,
      height: 14
    };

    this.enemyHitbox = {
      width: 18.5,
      height: 9
    };

    // VISUAL OFFSETS (Shift sprite relative to hitbox)
    // Positive X = Shift Sprite Right, Positive Y = Shift Sprite Down
    this.attackVisualOffset = {
      x: 9,
      y: -8
    };
  }

  preload() {
    this.load.spritesheet('enemySprite', '/Assets/snake-mob.png', {
      frameWidth: 22,
      frameHeight: 11
    }); // enemy spritesheet

    this.load.spritesheet('player_attack_sheet', '/Assets/Main Character Attack.png', {
      frameWidth: 64,
      frameHeight: 64
    })

    this.load.spritesheet('chests', '/Assets/chests.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    /*this.load.spritesheet('hitAnim', '/Assets/hit.png', { // not created yet
      frameWidth: 64,
      frameHeight: 64
    });
  */
    this.load.image("frame","/Assets/ARCADE_BORDER.png")
    this.load.image('player_still', '/Assets/Main Character Standing SSl.png'); //player image
    this.load.spritesheet("player_jumping", "/Assets/Main Character Jump SS.png", {
      frameWidth: 16,
      frameHeight: 16
    })
    this.load.spritesheet('player_running', '/Assets/Main Character Running SS.png', {
      frameWidth: 16,
      frameHeight: 16
    })
    this.load.audio('background', '/Assets/audio/background_music_filler.mp3');
    this.load.tilemapTiledJSON('map', '/Assets/Map/BaseMap.tmj');
    this.load.image('tiles', '/Assets/Map/tileset.png');
    this.load.image('spikes', '/Assets/Map/spikes.png');

  }
  create() {
    this.physics.world.roundPixels = true;
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
        end: 19
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
    // --- Create Animation --- (not in yet)
    /*this.anims.create({
      key: 'hit',
      frames: this.anims.generateFrameNumbers('hitAnim', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0
    });*/
    const map = this.make.tilemap({
      key: "map"
    })
    const tileset = map.addTilesetImage("gametiles", "tiles")
    const spikeTileset = map.addTilesetImage("spikes", "spikes")
    this.ground = map.createLayer("platforms", tileset)
    const spikes = map.createLayer("spikes", spikeTileset)
    this.ground.setCollisionByExclusion([-1]);
    
    
    
    // --- Create Player ---
    this.player = this.physics.add.sprite(100, 250, "player_still");
    this.player.setVisible(false); // Hide physics body sprite
    
    // Create Visual Sprite (No Physics)
    this.playerVisual = this.add.sprite(100, 250, "player_still");
    this.playerVisual.setDepth(10); // Ensure it renders on top
    
    // Auto-center hitbox
    const pWidth = this.playerHitbox.width;
    const pHeight = this.playerHitbox.height;
    const pOffsetX = (this.player.width - pWidth) / 2;
    const pOffsetY = (this.player.height - pHeight); // Align to bottom
    // If you want pure center: (this.player.height - pHeight) / 2
    
    this.player.body.setSize(pWidth, pHeight);
    this.player.body.setOffset(pOffsetX, pOffsetY);
    
    // --- Create Spikes Collision ---
    spikes.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, spikes, this.handleSpikeOverlap, null, this);
    
    this.physics.add.collider(this.player, this.ground)
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.setRoundPixels(true);
    // Force disable debug (just in case)
    this.physics.world.drawDebug = false;
    if (this.physics.world.debugGraphic) {
      this.physics.world.debugGraphic.setVisible(false);
    }
    // --- Create Enemy Group ---
    this.enemies = this.physics.add.group(); //  group for enemies

    // Spawn multiple enemies
    this.spawnEnemy(200, 280);
    this.spawnEnemy(500, 250);
    this.spawnEnemy(650, 250);
    this.spawnEnemy(500, 80);
    this.spawnEnemy(1050, 250);

    this.physics.add.collider(this.enemies, this.ground);

    // enemy projectiles
    this.projectiles = this.physics.add.group();
    
    this.physics.add.collider(this.projectiles, this.ground, (proj) => {
      proj.destroy();
    });
    
    // player projectiles
    this.playerProjectiles = this.physics.add.group();
    
    this.physics.add.collider(this.playerProjectiles, this.ground, (proj) => {
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
    const chest = this.chests.create(70, 72, 'chests', 0); // Frame 0 = closed
    chest.body.setAllowGravity(false); // assuming chest stays in place
    // chest.setImmovable(true); 
    
    this.physics.add.overlap(this.player, this.chests, (player, chest) => {
      this.handleChestOverlap(player, chest);
    });
    
    this.hasRangedAttack = false;
    this.lastFiredTime = 0; // Initialize cooldown timer
    
    
    
    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();
    
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    
    this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    // this.add.image(0,0,"frame").setOrigin(0,0).setScrollFactor(0).setDepth(1001)
    // --- Text ---
    this.healthText = this.add.text(16, 16, 'Health: 3', { // : health display
      fontFamily: "./code_fonts/melodica.regular.otf",
      fontSize: "32px",
      fill: "#ffffff"
    });
    
    this.healthText.setScrollFactor(0); // : fix text to camera
    this.healthText.setScrollFactor(0); // : fix text to camera
    this.healthText.setDepth(1000); // : ensure text is on top

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

    // --- Post-Update Sync (Fixes Lag/Blur) ---
    // Sync runs AFTER physics, ensuring visual matches actual body position for this frame
    this.events.on('postupdate', () => {
      if (this.playerVisual && this.player) {
        let vX = this.player.x;
        let vY = this.player.y;

        // Apply Visual Offsets when attacking
        if (this.isAttacking) {
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
  }

  update(time, delta) {
    if (this.playerIsDead) return; // prevent movement while dead

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
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
      this.performAttack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
      this.scene.pause()
      this.scene.launch("Pause")
    }

    // Ranged Attack Input
    if (Phaser.Input.Keyboard.JustDown(this.fireKey) && this.hasRangedAttack) {
      if (time > this.lastFiredTime + 3000) { // 3s cooldown
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
      this.player.setVelocityX(-200);



    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      if (this.onGround) {
        this.playerVisual.play("player_moving", true)
      }
      this.player.setVelocityX(200);

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
    this.updatePlayerHitbox();
  }

  performAttack() {
    this.isJumping = false
    this.isAttacking = true;
    this.player.setVelocityX(0); // Stop horizontal movement

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
    attackHitbox.body.setSize(20, 20);
    attackHitbox.setVisible(false); // Invisible sprite
    attackHitbox.body.allowGravity = false;
    attackHitbox.body.debugBodyColor = 0xffff00; // Yellow for attack
    this.playerVisual.play("player_attack", true);

    // Check overlap with enemies
    this.physics.add.overlap(attackHitbox, this.enemies, (hitbox, enemy) => {
      if (!enemy.body.enable) return; // Prevent multiple hits
      enemy.body.enable = false;
      this.playerVisual.play("player_attack", true);
      // Hitstop effect
      this.physics.world.pause();
      this.anims.pauseAll();


      setTimeout(() => {
        this.physics.world.resume();
        this.anims.resumeAll();
        enemy.destroy();
      }, 100); // 100ms freeze
    });

    // Remove hitbox after short duration
    this.time.delayedCall(100, () => {
      attackHitbox.destroy();
    });

    // Reset attack state after fixed duration (independent of animation)
    this.time.delayedCall(500, () => {
      this.isAttacking = false;
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

    // Trigger Hitstop (Freezeframe)
    this.physics.world.pause();
    this.anims.pauseAll();
    this.isInvincible = true; // Lock collisions during freeze

    // Use setTimeout to ignore engine time scale effectively
    setTimeout(() => {
      this.physics.world.resume();
      this.anims.resumeAll();

      this.health--;
      this.healthText.setText(`Health: ${this.health}`);

      if (this.health <= 0) {
        this.killPlayer();
      } else {
        // Invulnerability Flashing
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
    }, 150); // 150ms freeze duration
  }

  handleSpikeOverlap(player, spike) {
    if (this.playerIsDead) return;
    // Check if we are really touching a spike tile (not empty space)
    if (spike && spike.index !== -1) {
      this.killPlayer();
    }
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
    this.health = 3;
    this.healthText.setText(`Health: ${this.health}`);
    this.playerIsDead = false;
    this.isInvincible = false;
    // Reset Player Position and Physics
    this.playerVisual.clearTint();
    this.playerVisual.setTexture("player_still"); // Reset animation to idle
    this.player.enableBody(true, 100, 250, true, false); // Reset to start pos, keep hidden
    this.playerVisual.setAlpha(1);
    this.player.setVelocity(0, 0);
    this.lastFiredTime = 0;
    this.isAttacking = false;
  }

  spawnEnemy(x, y) {
    const enemy = this.enemies.create(x, y, 'enemySprite');
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
    if (this.hasRangedAttack) return;

    this.hasRangedAttack = true;
    chest.setFrame(1);
    chest.disableBody();
    const text = this.add.text(chest.x, chest.y - 20, "Special Unlocked!", { fontSize: "12px", fill: "#fff" });

    // Fade out text and destroy chest after delay
    this.time.delayedCall(1000, () => {
      text.destroy();
      chest.destroy();
    });
  }

  fireProjectile(time) {
    this.lastFiredTime = time;
    const proj = this.add.rectangle(this.player.x, this.player.y, 10, 10, 0x00ffff);
    this.physics.add.existing(proj);
    this.playerProjectiles.add(proj); // Use separate group!

    proj.body.allowGravity = false;
    const velocity = this.player.flipX ? -400 : 400;
    proj.body.setVelocityX(velocity);

    // auto destroy
    this.time.delayedCall(2000, () => {
      if (proj.active) proj.destroy();
    });

    // Add collision with enemies
    this.physics.add.overlap(proj, this.enemies, (projectile, enemy) => {
      projectile.destroy();
      enemy.destroy();
    });
    // hit wall
    this.physics.add.collider(proj, this.ground, () => {
      proj.destroy();
    });
  }

  updateEnemy(enemy) {
    if (!enemy.body) return;

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
