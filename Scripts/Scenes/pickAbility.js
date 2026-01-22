import Phaser from 'phaser';

export default class pickAbility extends Phaser.Scene {
  constructor() {
    super({ key: 'pickAbility' });
  }

  preload() {
    this.load.bitmapFont("arcade_font", "Assets/PressStart.png", "Assets/PressStart.xml");

  }
  create() {
    const { width, height } = this.scale;
    // Title text
    this.specialWeapon = 0
    this.add.bitmapText(width / 2, height / 2 - 70,"arcade_font", "Upgrade",16).setOrigin(0.5);
    



  }
}
