import * as Phaser from 'phaser';
import Menu from './Scenes/menu.js';
import MainScene from './Scenes/mainscene.js';
import Pause from "./Scenes/pause.js"
import Intro from './Scenes/intro.js';
import Options from './Scenes/options.js';
import boss from './Scenes/boss.js';
import LevelTwo from './Scenes/leveltwo.js';
import Overworld from './Scenes/overworld.js';
import DragonBossScene from './Scenes/dragonboss.js';  // NEW
import arcade_exterior from './Scenes/arcade_exterior.js';
import Narator from './Scenes/narrator.js';


const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 180,
  zoom: 5,
  backgroundColor: '#ff0000ff',
  pixelArt: true,
  antialias:true,
  parent: 'game-container',

  // DragonBossScene added at the end of the scene list
  scene: [Intro,arcade_exterior, Menu, MainScene, Pause, Options, boss, LevelTwo, Overworld, DragonBossScene, Narator],

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false          // set to true for hitbox debugging
    }
  }
};

window.addEventListener('load', () => {
  new Phaser.Game(config);
});