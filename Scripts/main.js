import Phaser from 'phaser';
import Menu from './Scenes/menu.js';
import MainScene from './Scenes/mainscene.js';
import Pause from "./Scenes/pause.js"
import Intro from './Scenes/intro.js';

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 224,
  zoom: 4.5,
  backgroundColor: '#ff0000ff',
  pixelArt: true,
  parent: 'game-container',

  scene: [Intro, Menu, MainScene,Pause],

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: true
    }
  }
};

window.addEventListener('load', () => {
  new Phaser.Game(config);
});
