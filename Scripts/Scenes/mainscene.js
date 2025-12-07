import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });

    this.lives = 3; // added: player lives
    this.playerIsDead = false; // added: track if player is dead
  }

  preload() {
    this.load.image('enemySprite', 'Assets/Enemy.png'); // enemy image
    this.load.image('projectileSprite', 'Assets/Projectile.png'); // projectile image

    this.load.spritesheet('hitAnim', 'Assets/hitAnim.png', { // added: collision animation
      frameWidth: 64,
      frameHeight: 64
    });

    this.load.image('shrek', 'Assets/Shrek.png'); //player image?
    this.load.audio('heheheha', 'Assets/audio/scotland.mp3');
  }

  create() {
    // --- Create Platforms ---
    this.platforms = this.physics.add.staticGroup();
    //gotta remember shrek (he da goat)
    this.platforms.create(400, 580, 'shrek').setScale(10, 0.5).refreshBody();
    this.platforms.create(600, 400, 'shrek').setScale(1, 0.5).refreshBody();
    this.platforms.create(50, 250, 'shrek').setScale(1, 0.5).refreshBody();

    // --- Create Player ---
    this.player = this.physics.add.sprite(100, 450, 'playerSprite'); // changed to playerSprite
    this.player.setScale(1);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.platforms);

    // --- Create Enemy Group ---
    this.enemies = this.physics.add.group(); // added: group for enemies
    const enemy = this.enemies.create(600, 450, 'enemySprite'); // added: initial enemy
    enemy.setCollideWorldBounds(true); // added
    this.physics.add.collider(this.enemies, this.platforms); // added

    // --- Create Projectile Group ---
    this.projectiles = this.physics.add.group(); // added

    this.physics.add.collider(this.projectiles, this.platforms, (proj) => { // added
      proj.destroy(); // added
    });

    // --- Collision detection: player ↔ enemies/projectiles ---
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => { // added
      this.handlePlayerDeath(enemy); // added
    });
    this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => { // added
      this.handlePlayerDeath(projectile); // added
    });

    // --- Create Animation ---
    this.anims.create({
      key: 'hit',
      frames: this.anims.generateFrameNumbers('hitAnim', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0
    });

    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Text ---
    this.livesText = this.add.text(8, 8, 'Lives: 3', { // added: lives display
      font: '18px Arial',
      fill: '#ffffff'
    });

    // --- Add and Play Distorted Music ---
    const music = this.sound.add('heheheha', { 
      loop: true,
      volume: 1 
    });
    music.setDetune(-700);
    music.play();
  }

  update() {
    if (this.playerIsDead) return; // prevent movement while dead

    // Left/Right Movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // Jumping
    if (this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-330);
    }
  }

  handlePlayerDeath(enemyOrProjectile) { 
    if (this.playerIsDead) return;
    this.playerIsDead = true;

    this.player.body.enable = false; 
    enemyOrProjectile.body.enable = false;

    this.player.play('hit'); 
    enemyOrProjectile.play?.('hit'); 

    this.time.delayedCall(500, () => { 
      enemyOrProjectile.destroy(); 
    });

    this.lives--;
    this.livesText.setText(`Lives: ${this.lives}`);

    if (this.lives <= 0) {
      this.time.delayedCall(1500, () => {
        this.scene.restart();
        this.lives = 3;
      });
      return;
    }

//------------Respawn player and reset physics--------------------
    
    this.time.delayedCall(2000, () => { //waits to respawn player (dramatic effect)
      this.player.destroy();
      this.player = this.physics.add.sprite(100, 450, 'playerSprite'); //set respawn location
      this.player.setScale(1); 
      this.player.setBounce(0.2);
      this.player.setCollideWorldBounds(true);
      this.physics.add.collider(this.player, this.platforms); 
      this.physics.add.overlap(this.player, this.enemies, (player, enemy) => { 
        this.handlePlayerDeath(enemy);
      });
      this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => {
        this.handlePlayerDeath(projectile);
      });
      this.playerIsDead = false;
    });
  }
}
