import Phaser from 'phaser';
import Menu from './Scenes/menu.js';
import MainScene from './Scenes/mainscene.js';
import Pause from "./Scenes/pause.js"
import Intro from './Scenes/intro.js';
import Options from './Scenes/options.js';
import boss from './Scenes/boss.js';

const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 180,
  zoom: 5,
  backgroundColor: '#ff0000ff',
  pixelArt: true,
  parent: 'game-container',

  scene: [Intro, Menu, MainScene, Pause, Options, boss],

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
