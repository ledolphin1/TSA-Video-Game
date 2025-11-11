// src/scenes/MainScene.js
import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('logo', '/assets/logo.png');
  }

  create() {
    const logo = this.add.image(400, 300, 'logo').setScale(0.5);
    logo.setInteractive();
    this.input.on('pointerdown', () => {
      this.tweens.add({
        targets: logo,
        y: 200,
        duration: 600,
        ease: 'Power2',
        yoyo: true
      });
    });

    this.add.text(8, 8, 'TSA Video Game — Phaser starter', {
      font: '18px Arial',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // game loop
  }
}