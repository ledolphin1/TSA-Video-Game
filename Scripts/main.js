
import Phaser from 'phaser';
import MainScene from './scenes/MainScene.js';

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 224,
  
  zoom: 4.5,
  
  backgroundColor: '#494949ff',
  pixelArt: true,
  parent: 'game-container',    
  scene: [MainScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  }
};
window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
});

