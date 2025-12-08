import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });

    this.lives = 3; // added: player lives
    this.playerIsDead = false; // added: track if player is dead
  }

  preload() {
    this.load.image('enemySprite', 'Assets/testSprite.png'); // enemy image
    //this.load.image('projectileSprite', 'Assets/Projectile.png'); // projectile image isn't here yet

    /*this.load.spritesheet('hitAnim', 'Assets/hit.png', { // not created yet
      frameWidth: 64,
      frameHeight: 64
    });
  */

    this.load.image('player', 'Assets/Main Character Standing SSl.png'); //player image
    this.load.audio('heheheha', 'Assets/audio/scotland.mp3');
    this.load.audio('background', 'Assets/audio/background_music_filler.mp3');
    this.load.image('shrek', 'Assets/shrek.png');
  }

  create() {
    // --- Create Platforms ---
    this.platforms = this.physics.add.staticGroup();
    //gotta remember shrek (he da goat)
    this.platforms.create(240, 400, 'shrek').setScale(0.6, 0.05).refreshBody();
    this.platforms.create(450, 330, 'shrek').setScale(0.6, 0.05).refreshBody();
    this.platforms.create(600, 190, 'shrek').setScale(0.6, 0.05).refreshBody();
    this.platforms.create(480, 540, 'shrek').setScale(9, 0.08).refreshBody(); //ground

    // --- Create Player ---
    this.player = this.physics.add.sprite(0, 145, 'player');
    this.player.setScale(3);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.platforms);

    // --- Create Enemy Group ---
    this.enemies = this.physics.add.group(); // added: group for enemies
    const enemy = this.enemies.create(450, 300, 'enemySprite'); // added: initial enemy
    enemy.setCollideWorldBounds(true); // added
    enemy.setScale(0.1);
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

    // --- Create Animation --- (not in yet)
    /*this.anims.create({
      key: 'hit',
      frames: this.anims.generateFrameNumbers('hitAnim', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0
    });*/

    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Text ---
    this.livesText = this.add.text(8, 8, 'Lives: 3', { // added: lives display
      font: '18px Arial',
      fill: '#ffffff'
    });

    // --- Add and Play Distorted Music ---
    const music = this.sound.add('background', { 
      loop: true,
      volume: 0.65 
    });
    //music.setDetune(-700); - I left it in just for you (i'm guessing its leo who added this)
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
      this.player.setVelocityY(-500);
    }
  }

  handlePlayerDeath(enemyOrProjectile) { 
    if (this.playerIsDead) return;
    this.playerIsDead = true;

    this.player.setVelocity(0,0);
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
    this.time.delayedCall(1000, () => { //waits to respawn player (dramatic effect)
      this.player = this.physics.add.sprite(100, 450, 'player'); //set respawn location
      this.player.setScale(3); 
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
