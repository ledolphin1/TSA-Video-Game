import Phaser from 'phaser';

export default class Options extends Phaser.Scene {
  constructor() {
    super({ key: 'Options' });
  }

  create() {
        const { width, height } = this.scale;

    // Title text
    this.add.text(width / 2, height / 2 - 50, 'OPTIONS', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: "#000000"
    }).setOrigin(0.5);

  
}
}