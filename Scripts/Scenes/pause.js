import * as Phaser from 'phaser';

export default class Pause extends Phaser.Scene {
  constructor() {
    super({ key: 'Pause' });
  }

  create() {
     const { width, height } = this.scale;

    // Title text

    const optionsbutton = this.add.image(width/2, height/2+50,"options").setScale(1.25).setOrigin(0.5).setInteractive({useHandCursor: true})

    // Play button
    const playButton = this.add.image(width/2,height/2+20,"play").setScale(1.25)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    // Hover effects
    playButton.on('pointerover', () => {
      playButton.setTexture("play_yellow");
    });

    playButton.on('pointerout', () => {
      playButton.setTexture("play");
    });

    playButton.on('pointerdown', () => {
      this.scene.stop()
      this.scene.resume('MainScene');
    });
     // Hover effects
    optionsbutton.on('pointerover', () => {
       optionsbutton.setTexture("options_yellow");
    });

    optionsbutton.on('pointerout', () => {
      optionsbutton.setTexture("options");
    });

    optionsbutton.on('pointerdown', () => {
      this.scene.pause()
      this.scene.launch('Options');
    });
    this.frame = this.add.image(0,0,"frame").setOrigin(0,0)
  }
}
