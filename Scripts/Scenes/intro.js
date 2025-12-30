import Phaser from 'phaser';

export default class Intro extends Phaser.Scene {
  constructor() {
    super({ key: 'Intro' });
  }
  preload() {
    this.load.video("intro_vid", "/Assets/Intro.mp4", true)
  }
  create() {
    const video = this.add.video(0, 0, 'intro_vid');
    video.setOrigin(0, 0)
    video.play(false); // false = do NOT loop
    video.on('complete', () => {
      this.scene.start('Menu');
    });


    // Skip Button
    const skipText = this.add.text(this.cameras.main.width - 20, 20, "SKIP >>", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(1, 0).setInteractive({ cursor: 'pointer' });

    skipText.on('pointerdown', () => {
      this.scene.start('Menu');
    });

    // Keyboard Skip
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('Menu');
    });
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('Menu');
    });
  }
}
