import Phaser from 'phaser';

export default class Pause extends Phaser.Scene {
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
    this.add.text(width / 2, height / 2 - 70, "Time to Get Stronger", {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);



  }
}
