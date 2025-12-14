
import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });

    this.lives = 3; // : player lives
    this.playerIsDead = false; // : track if player is dead
  }

  preload() {
    this.load.image('enemySprite', 'Assets/snake-mob.png'); // enemy image

    /*this.load.spritesheet('hitAnim', 'Assets/hit.png', { // not created yet
      frameWidth: 64,
      frameHeight: 64
    });
  */

    this.load.image('player_still', 'Assets/Main Character Standing SSl.png'); //player image
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
    this.physics.add.collider(this.player, this.ground)
    this.cameras.main.startFollow(this.player, false, 1, 1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.setRoundPixels(true);
    // --- Create Enemy Group ---
    this.enemies = this.physics.add.group(); //  group for enemies
    const enemy = this.enemies.create(450, 300, 'enemySprite'); //  initial enemy
    enemy.setCollideWorldBounds(true); // 
    enemy.setScale(0.1);
    this.physics.add.collider(this.enemies, this.ground);

    // --- Create Projectile Group ---
    this.projectiles = this.physics.add.group();

    this.physics.add.collider(this.projectiles, this.ground, (proj) => {
      proj.destroy(); // 
    });
    //Collision detection: player  enemies/projectiles
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      this.handlePlayerDeath(enemy);
    });
    this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => {
      this.handlePlayerDeath(projectile);
    });


    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Text ---
    this.livesText = this.add.text(0, 0, 'Lives: 3', { // : lives display
      fontFamily: "./code_fonts/melodica.regular.otf",
      fontSize: "16px",
      fill: "#ffffff"
    });

    this.livesText.setScrollFactor(0); // : fix text to camera
    this.livesText.setDepth(1000); // : ensure text is on top

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

    const onGround = this.player.body.blocked.down;
    if (onGround) {
      this.lastGroundedTime = time;
    }

    // Left/Right Movement

    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      this.player.play("player_moving", true)
      this.player.setVelocityX(-200);



    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      this.player.play("player_moving", true)
      this.player.setVelocityX(200);

    } else {
      this.player.setVelocityX(0);
      this.player.setTexture("player_still")
    }

    // Jumping
    if (this.cursors.up.isDown && (onGround || (time - this.lastGroundedTime < 100))) {
      this.player.setVelocityY(-300);
      this.lastGroundedTime = 0;
    }

    // Variable jump height: cut velocity when button is released
    if (Phaser.Input.Keyboard.JustUp(this.cursors.up) && this.player.body.velocity.y < 0) {
      this.player.setVelocityY(this.player.body.velocity.y * 0.5);
    }
  }

  handlePlayerDeath(enemyOrProjectile) {
    if (this.playerIsDead) return;
    this.playerIsDead = true;

    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0);
    this.player.body.enable = false;

    enemyOrProjectile.body.enable = false;

    //this.player.play('hit'); 
    //enemyOrProjectile.play?.('hit'); 

    enemyOrProjectile.destroy();

    this.lives--;
    this.livesText.setText(`Lives: ${this.lives}`); //read lives

    if (this.lives <= 0) {
      this.lives = 3; // reset before restart
      this.time.delayedCall(1500, () => {
        this.scene.restart();
      });
      return;
    }

    //------------Respawn player and reset physics--------------------

    this.player.destroy();
    this.player = this.physics.add.sprite(100, 100, 'player_still'); //set respawn location
    this.player.setScale(3);
    // this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      this.handlePlayerDeath(enemy);
    });
    this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => {
      this.handlePlayerDeath(projectile);
    });
    this.playerIsDead = false;
  }
}
