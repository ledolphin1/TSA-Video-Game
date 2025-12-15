import Phaser from 'phaser';

export default class Menu extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
  }

  create() {
    const { width, height } = this.scale;

    // Title text
    this.add.text(width / 2, height / 2 - 50, 'OUT OF ORDER', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const optionsbutton = this.add.text(width / 2, height / 2 -10, 'OPTIONS', {
      fontSize: '24px',
      color: '#0099ccff',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({useHandCursor: true})

    // Play button
    const playButton = this.add.text(width / 2, height / 2 +20, 'PLAY', {
      fontSize: '24px',
      color: '#0099ccff',
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
      this.scene.start('MainScene');
    });
     // Hover effects
    playButton.on('pointerover', () => {
      playButton.setStyle({ color: '#0e00ccff' });
    });

    playButton.on('pointerout', () => {
      playButton.setStyle({ color: '#0099ccff' });
    });

    playButton.on('pointerdown', () => {
      this.scene.pause()
      this.scene.launch('Options');
    });
  }
}
