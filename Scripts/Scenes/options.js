import * as Phaser from 'phaser';

export default class Options extends Phaser.Scene {
  constructor() {
    super({ key: 'Options' });
  }
  preload() {
    this.load.spritesheet("knob", "Assets/knob.png", {
      frameWidth: 16,
      frameHeight: 16
    })
    this.load.image("back", "Assets/back.png")
    this.load.image("back_yellow", "Assets/back_yellow.png")
    this.load.image("slider", "Assets/slider.png")
    this.load.image("sound", "Assets/sound.png")
  }
  create() {
    const { width, height } = this.scale;
    this.anims.create({
      key: "knob_anim",
      frames: this.anims.generateFrameNumbers("knob"),
      frameRate: 10,
      repeat: -1
    })
    // Title text

    this.add.rectangle(width / 2, height / 2, 200, 140, "#000000")
    this.add.image(width / 2, height / 2 - 20, "options").setScale(2).setOrigin(0.5);
    this.add.image(width / 2, height / 2 + 10, "sound").setScale(1.25).setOrigin(0.5);
    this.backButton = this.add.image(width / 2, height / 2 + 50, "back").setScale(1.25).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.add.image(width / 2, height / 2 + 30, "slider").setOrigin(0.5);

    this.knob = this.add.sprite(width / 2, height / 2 + 30, "knob").setScale(2)
    this.backButton.on('pointerover', () => {
      this.backButton.setTexture("back_yellow");
    });

    this.backButton.on('pointerout', () => {
      this.backButton.setTexture("back");
    });

    this.backButton.on('pointerdown', () => {
      this.scene.resume('Menu');
      this.scene.stop()
    });

    this.knob.play("knob_anim")

  }
}