import * as Phaser from 'phaser';

export default class Pause extends Phaser.Scene {
  constructor() {
    super({ key: 'Pause' });
  }

  init(data) {
    this.returnScene = data.returnScene;
  }

  preload() {
    this.load.spritesheet("knob", "public/assets/knob-sheet.png", {
      frameWidth: 16,
      frameHeight: 16
    })
    this.load.image("back", "public/assets/back.png")
    this.load.image("back_yellow", "public/assets/back_yellow.png")
    this.load.image("slider", "public/assets/slider.png")
    this.load.image("sound", "public/assets/sound.png")
  }
  create() {
    this.scene.bringToTop();
    const { width, height } = this.scale;
    this.anims.create({
      key: "knob_anim",
      frames: this.anims.generateFrameNumbers("knob"),
      frameRate: 10,
      repeat: -1
    })
    // Title text

    this.add.image(width / 2, height / 2 - 20, "options").setScale(2).setOrigin(0.5);
    this.add.image(width / 2, height / 2 + 10, "sound").setScale(1.25).setOrigin(0.5);
    this.backButton = this.add.image(width / 2, height / 2 + 50, "back").setScale(1.25).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.track = this.add.image(width / 2, height / 2 + 30, "slider").setOrigin(0.5);

    const handle = this.add.sprite(width / 2, height / 2 + 30, "knob").setScale(2)
    handle.play('knob_anim'); 
    handle.setInteractive({ draggable: true });
    handle.x = this.sound.volume*225+47.5;
    this.input.setDraggable(handle);
    this.input.on('drag', (pointer, gameObject, dragX) => {

        // clamp inside the track
        const minX = this.track.x - this.track.width / 2 + 10;
        const maxX = this.track.x + this.track.width / 2 - 10;

        gameObject.x = Phaser.Math.Clamp(dragX, minX, maxX);

        this.sound.volume = Math.round((gameObject.x-47.5)/225 * 100)/100;
    })


    this.backButton.on('pointerover', () => {
      this.backButton.setTexture("back_yellow");
    });

    this.backButton.on('pointerout', () => {
      this.backButton.setTexture("back");
    });

    this.backButton.on('pointerdown', () => {
      this.scene.resume(this.returnScene);
      this.scene.stop()
    });


  }

}
