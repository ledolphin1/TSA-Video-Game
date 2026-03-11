import * as Phaser from 'phaser';

import { playerData } from './playerdata.js';
import { customEmitter } from './events.js';
export default class Narator extends Phaser.Scene {
  constructor() {
    super({ key: 'Narator',active: true});
  }
  preload() {
    this.load.bitmapFont("game_font", "assets/pixel_fonts/fonts/square_6x6.png", "assets/pixel_fonts/fonts/square_6x6.xml")
  }
  create() {
      this.line1 = this.add.bitmapText(this.cameras.main.width - 10, 30, 'game_font', '', 10).setOrigin(1, 1)
      
      this.line2 = this.add.bitmapText(this.cameras.main.width - 10, 40, 'game_font', '', 10).setOrigin(1, 1)
    this.setNarrator = function(t1,t2){
          this.line1.setText(t1)
          this.line2.setText(t2)
      };
      customEmitter.on("ARCADE_EXTERIOR_BEGIN", this.setNarrator.bind(this,"Enter the arcade.","Press left and right arrow keys to move."))
      customEmitter.on("MOVED",onMove.bind(this))
      function onMove(){
          if (playerData.didMove){
              return;
            }
            this.setNarrator("Enter the arcade.","Move to the door and press Z to interact.");
            playerData.didMove = true;
        }
        customEmitter.on("OVERWORLD_BEGIN", this.setNarrator.bind(this,"Inspect the suspicious arcade machine.","Move to the arcade and press Z to inspect."))
        customEmitter.on("L1BEGIN", this.setNarrator.bind(this,"Don't fall on spikes.","Press up arrow to jump."))
        customEmitter.on("JUMPED", onJump.bind(this))
        customEmitter.on("ATTACKED",onAttack.bind(this))
        customEmitter.on("LPFIRED", this.setNarrator.bind(this,"Push forward! Vanquish the evil snakes!","Find the gate."))
        customEmitter.on("SNAKEBOSS_BEGIN", this.setNarrator.bind(this,"This snake fires homing orbs!","Use your Cyber Canon and Plasma Saber."))
        customEmitter.on("L2BEGIN", this.setNarrator.bind(this,"Navigate the rough terrain.","These viruses are stronger and smarter than snakes, push through!"))
        customEmitter.on("DRAGONBOSS", this.setNarrator.bind(this,"",""))
        
    function onJump(){
        if (playerData.didJump){
            return;
        }
            this.setNarrator("Push forward! Vanquish the evil snakes!","Press SPACE to use your Plasma Saber.");
            playerData.didJump = true;
        }
        
  
    function onAttack(){
        if (playerData.didAttack){
            return;
        }
            this.setNarrator("Push forward! Vanquish the evil snakes!","Press F to use your Cyber Cannon.");
            playerData.didAttack = true;
        }
        
    }
 
}
