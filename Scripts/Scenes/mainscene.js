
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

    // Adjustable values for Enemy
    this.enemyHitbox = {
      width: 10,
      height: 12
    };
  }

  preload() {
    this.load.spritesheet('enemySprite', 'Assets/snake-mob.png', {
      frameWidth: 22,
      frameHeight: 16
    }); // enemy spritesheet

    /*this.load.spritesheet('hitAnim', 'Assets/hit.png', { // not created yet
      frameWidth: 64,
      frameHeight: 64
    });
  */
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
    this.load.tilemapTiledJSON('map', 'Assets/Map/BaseMap.tmj');
    this.load.image('tiles', 'Assets/Map/tileset.png');
    this.load.image('spikes', 'Assets/Map/spikes.png');

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
    this.cameras.main.startFollow(this.player, false, 1, 1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.setRoundPixels(true);
    // --- Create Enemy Group ---
    this.enemies = this.physics.add.group(); //  group for enemies
    const enemy = this.enemies.create(450, 200, 'enemySprite'); //  initial enemy

    // Auto-center hitbox
    const eWidth = this.enemyHitbox.width;
    const eHeight = this.enemyHitbox.height;
    const eOffsetX = (enemy.width - eWidth) / 2;
    const eOffsetY = (enemy.height - eHeight); // Align to bottom

    enemy.body.setSize(eWidth, eHeight);
    enemy.body.setOffset(eOffsetX, eOffsetY);
    enemy.body.debugBodyColor = 0xff0000;

    enemy.setCollideWorldBounds(true); // 
    enemy.setVelocityX(50); // Start moving right
    this.physics.add.collider(this.enemies, this.ground);

    // --- Create Projectile Group ---
    this.projectiles = this.physics.add.group();

    this.physics.add.collider(this.projectiles, this.ground, (proj) => {
      proj.destroy();
    });

    //Collision detection: player  enemies/projectiles
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      this.handleEnemyOverlap(player, enemy);
    });
    this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => {
      this.handleEnemyOverlap(player, projectile);
      projectile.destroy();
    });


    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();

    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // --- Text ---
    this.healthText = this.add.text(16, 16, 'Health: 3', { // : health display
      fontFamily: "./code_fonts/melodica.regular.otf",
      fontSize: "32px",
      fill: "#ffffff"
    });

    this.healthText.setScrollFactor(0); // : fix text to camera
    this.healthText.setDepth(1000); // : ensure text is on top

    // --- Add and Play Distorted Music ---
    const music = this.sound.add('background', {
      loop: true,
      volume: 0.65
    });
    //music.setDetune(-700); - I left it in just for you (i'm guessing its leo who added this)
    music.play();
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
    if (this.player.body.velocity.y > 0) {
      this.player.play("player_falling", true)
    }
    // Attack Input
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
      this.performAttack();
    }

    if (this.isAttacking) return;

    // Left/Right Movement

    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      if (this.onGround) {
        this.player.play("player_moving", true)
      }
      this.player.setVelocityX(-200);



    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      if (this.onGround) {
        this.player.play("player_moving", true)
      }
      this.player.setVelocityX(200);

    } else {
      this.player.setVelocityX(0);
      if (this.onGround) {
        this.player.setTexture("player_still")
      }
    }

    // Jumping
    if (this.cursors.up.isDown && (this.onGround || (time - this.lastGroundedTime < 100))) {
      this.player.setVelocityY(-300);
      this.lastGroundedTime = 0;
      this.isJumping = true;
      this.player.play("player_jump_start", true);
    }

    // Variable jump height: cut velocity when button is released
    if (Phaser.Input.Keyboard.JustUp(this.cursors.up) && this.player.body.velocity.y < 0) {
      this.player.setVelocityY(this.player.body.velocity.y * 0.5);
    }
  }

  performAttack() {
    this.isJumping = false
    this.isAttacking = true;
    this.player.setVelocityX(0); // Stop horizontal movement

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

    // Check overlap with enemies
    this.physics.add.overlap(attackHitbox, this.enemies, (hitbox, enemy) => {
      if (!enemy.body.enable) return; // Prevent multiple hits
      enemy.body.enable = false;

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
      this.isAttacking = false;
    });
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
          targets: this.player,
          alpha: 0.5,
          duration: 100,
          yoyo: true,
          repeat: 5,
          onComplete: () => {
            this.player.alpha = 1;
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
    this.player.setTint(0xff0000); // Visual feedback for death

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
    this.player.clearTint();
    this.player.enableBody(true, 100, 250, true, true); // Reset to start pos
    this.player.setAlpha(1);
    this.player.setVelocity(0, 0);

    // Ensure camera is still following (should be, since we didn't destroy player)
    // Restart logic is cleaner this way than scene.restart() usually, 
    // but if we want full level reset we can do scene.restart(). 
    // User asked to fix respawning, so let's stick to keeping the scene alive.
    // If the user preferred scene restart, we can uncomment:
    // this.scene.restart(); 
  }

  updateEnemy(enemy) {
    if (!enemy.body) return;

    // 1. Wall Detection (Arcade Physics "blocked" check)
    if (enemy.body.blocked.right) {
      enemy.setVelocityX(-50);
      enemy.flipX = false;
    } else if (enemy.body.blocked.left) {
      enemy.setVelocityX(50);
      enemy.flipX = true;
    }

    // 2. Cliff Detection
    // Only check if grounded to avoid flipping while falling
    if (enemy.body.blocked.down) {
      const isMovingRight = enemy.body.velocity.x > 0;
      const xOffset = isMovingRight ? enemy.body.width + 5 : -5;
      const checkX = enemy.body.x + xOffset; // Check just past the edge of the physics body
      const checkY = enemy.body.bottom + 2;  // Just below feet

      // Check for tile at that position on the collision layer
      const tile = this.ground.getTileAtWorldXY(checkX, checkY);

      if (!tile || tile.index === -1) {
        // No tile found OR tile is empty (-1) -> Cliff!
        // Turn around
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
