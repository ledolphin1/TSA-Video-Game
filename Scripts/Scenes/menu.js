import * as Phaser from 'phaser';

export default class Menu extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
  }
  preload(){
    this.load.image("frame", "/Assets/ARCADE_BORDER.png")
    this.load.image("title","/Assets/title.png")
    this.load.image("play","Assets/play.png")
    this.load.image("options","Assets/options.png")
    this.load.image("options_yellow","Assets/options_yellow.png")
    this.load.image("play_yellow","Assets/play_unhighlighted.png")
  }
  create() {
    const { width, height } = this.scale;

    // Title text
    this.add.image(width/2,height/2-10,"title")

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
      this.scene.start('MainScene');
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
