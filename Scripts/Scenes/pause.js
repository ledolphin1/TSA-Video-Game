import Phaser from 'phaser';

export default class Pause extends Phaser.Scene {
  constructor() {
    super({ key: 'Pause' });
  }

  create() {
    const { width, height } = this.scale;

    // Title text
    this.add.text(width / 2, height / 2 - 70, 'Paused', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Play button
    const playButton = this.add.text(width / 2, height / 2, 'Resume', {
      fontSize: '24px',
      color: '#0099ccff',
      backgroundColor: '#000000',
      padding: { x: 12, y: 6 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    // Hover effects
    playButton.on('pointerover', () => {
      playButton.setStyle({ color: '#0e00ccff' });
    });

    playButton.on('pointerout', () => {
      playButton.setStyle({ color: '#0099ccff' });
    });

    playButton.on('pointerdown', () => {
      this.scene.resume('MainScene');
      this.scene.stop()
    });
  }
}
