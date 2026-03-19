import * as Phaser from "phaser";
import Menu from "./Scenes/menu.js";
import MainScene from "./Scenes/mainscene.js";
import Pause from "./Scenes/pause.js"
import Intro from "./Scenes/intro.js";
import Options from "./Scenes/options.js";
import boss from "./Scenes/boss.js";
import LevelTwo from "./Scenes/leveltwo.js";
import Overworld from "./Scenes/overworld.js";
import DragonBossScene from "./Scenes/dragonboss.js";  // NEW
import arcade_exterior from "./Scenes/arcade_exterior.js";
import Narator from "./Scenes/narrator.js";
import boss_transition from "./Scenes/boss_transition.js";
import pickAbility from "./Scenes/pickAbility.js";
import CarSfIntro from "./Scenes/car_sf_intro.js";
import WinCredits from "./Scenes/win_credits.js";
import playerSelectAbility from "./Scenes/playerSelectAbility.js";
import codeSpooky from "./Scenes/codeSpooky.js";
import arcade_exterior_outro from "./Scenes/arcade_exterior_outro.js";
console.log("I loaded we have a chance after all")
const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 180,
  zoom: 5,
  backgroundColor: "#ff0000ff",
  pixelArt: true,
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true
  },
  parent: "game-container",

  // DragonBossScene added at the end of the scene list
  scene: [Intro, Menu, CarSfIntro,codeSpooky, arcade_exterior, MainScene, Pause, Options, boss, LevelTwo, Overworld, DragonBossScene, Narator, boss_transition, pickAbility, WinCredits,playerSelectAbility,arcade_exterior_outro],

  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 },
      debug: false         // set to true for hitbox debugging
    }
  }
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});