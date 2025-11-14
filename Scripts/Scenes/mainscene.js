
import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('shrek', 'Assets/Shrek.png');
    this.load.audio('heheheha', 'Assets/audio/scotland.mp3');
  }

  create() {
                // --- Create Platforms ---
                this.platforms = this.physics.add.staticGroup();

                // Create the ground.
                // We stretch the 'shrek' image to act as a platform.
                this.platforms.create(400, 580, 'shrek').setScale(10, 0.5).refreshBody();

                // Create a couple of smaller ledges
                this.platforms.create(600, 400, 'shrek').setScale(1, 0.5).refreshBody();
                this.platforms.create(50, 250, 'shrek').setScale(1, 0.5).refreshBody();

                // --- Create Player ---
                this.player = this.physics.add.sprite(100, 450, 'shrek');

                // Set player properties
                this.player.setScale(0.2); // Make the player smaller
                this.player.setBounce(0.2); // A little bounce
                this.player.setCollideWorldBounds(true); // Don't fall off-screen

                // --- Physics ---
                this.physics.add.collider(this.player, this.platforms);

                // --- Controls ---
                this.cursors = this.input.keyboard.createCursorKeys();

                // --- Text ---
                this.add.text(8, 8, 'Shrek Platformer!\n(Click game to start audio)', {
                    font: '18px Arial',
                    fill: '#ffffff'
                });

                // --- Add and Play Distorted Music ---
                const music = this.sound.add('heheheha', { 
                    loop: true,
                    volume: 1 
                });

                // "Distort" the music by detuning it (lowering the pitch).
                music.setDetune(-700);

                // Play the music.
                // Note: Most browsers will require a user click on the game
                // canvas before the audio will start.
                music.play();
            }

            update(time, delta) {
                // --- Game Loop ---

                // Left/Right Movement
                if (this.cursors.left.isDown) {
                    this.player.setVelocityX(-160);
                } else if (this.cursors.right.isDown) {
                    this.player.setVelocityX(160);
                } else {
                    // Stop moving
                    this.player.setVelocityX(0);
                }

                // Jumping
                // We check 'body.blocked.down' instead of 'body.touching.down'
                // This is a more reliable way to check for ground collision.
                if (this.cursors.up.isDown && this.player.body.blocked.down) {
                    this.player.setVelocityY(-330);
                }
            }
}
