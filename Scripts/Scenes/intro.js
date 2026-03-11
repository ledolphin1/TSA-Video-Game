import * as Phaser from 'phaser';
import { playerData } from './playerdata.js';
export default class Intro extends Phaser.Scene {
  constructor() {
    super({ key: 'Intro' });
  }
  preload() {
    this.load.video("intro_vid", "assets/Intro.mp4", true)

    this.load.bitmapFont("arcade_font", "assets/PressStart.png", "assets/PressStart.xml")
  }
  create() {
    console.log(playerData);
    
    const video = this.add.video(0, 0, 'intro_vid');
    video.setOrigin(0, 0)
    video.play(false);
    video.on('complete', () => {
      this.scene.start('Menu');
    });

    this.cameras.main.roundPixels = true;
    // Skip Button
    const skipText = this.add.bitmapText(this.cameras.main.width - 20, 20, 'arcade_font', 'SKIP', 8).setOrigin(1, 0).setInteractive({ cursor: 'pointer' })

    skipText.on("pointerover", () => {
      skipText.setTint("0xFFFF00");
    })

    skipText.on("pointerout", () => {
      skipText.setTint("0xFFFFFF");
    })

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
