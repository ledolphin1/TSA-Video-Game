import * as Phaser from 'phaser';

export default class arcadeExterior extends Phaser.Scene {
  constructor() {
    super({ key: 'arcadeExterior' });
  }
  preload() {
    this.load.video("intro_vid_ext", "Assets/Arcade Exterior.mp4", true)

    this.load.bitmapFont("arcade_font", "Assets/PressStart.png", "Assets/PressStart.xml")
  }
  create() {
    const video = this.add.video(0, 0, 'intro_vid_ext');
    video.setOrigin(0, 0)
    video.play(false);
    video.on('complete', () => {
      this.scene.start('overworld');
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
      this.scene.start('overworld');
    });
}
}
