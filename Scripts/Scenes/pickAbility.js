import * as Phaser from 'phaser';

export default class Pause extends Phaser.Scene {
  constructor() {
    super({ key: 'pickAbility' });
  }

  preload() {
    this.load.bitmapFont("arcade_font", "assets/PressStart.png", "assets/PressStart.xml");
    this.load.bitmapFont("game_font", "assets/pixel_fonts/fonts/square_6x6.png", "assets/pixel_fonts/fonts/square_6x6.xml")

  }
  create() {
    const { width, height } = this.scale;
    // Title text
    this.add.bitmapText(width/2, 20, "Pick your power")



  }
}
