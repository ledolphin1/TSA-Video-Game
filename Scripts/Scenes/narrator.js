import * as Phaser from 'phaser';

import { playerData } from './playerdata.js';
import { customEmitter } from './events.js';
export default class Narator extends Phaser.Scene {
  constructor() {
    super({ key: 'Narator',active: true});
  }
  preload() {
    this.load.bitmapFont("game_font", "public/assets/pixel_fonts/fonts/square_6x6.png", "public/assets/pixel_fonts/fonts/square_6x6.xml")
  }
  create() {
      this.line1 = this.add.bitmapText(this.cameras.main.width - 10, 30, 'game_font', '', 10).setOrigin(1, 1)
      
      this.line2 = this.add.bitmapText(this.cameras.main.width - 10, 40, 'game_font', '', 10).setOrigin(1, 1)

            this._typingEvents = [];
            this._typingMaskGraphics = [];
            this._typingRunId = 0;

            this._clearTypingEvents = function() {
                this._typingEvents.forEach((event) => {
                    if (event && !event.hasDispatched) {
                        event.remove(false);
                    }
                });
                this._typingEvents = [];

                this._typingMaskGraphics.forEach((gfx) => {
                    if (gfx && gfx.active) {
                        gfx.destroy();
                    }
                });
                this._typingMaskGraphics = [];

                this.line1.clearMask();
                this.line2.clearMask();
            };

            this._typeLine = function(textObj, fullText, delay = 28, onComplete = null) {
                if (!fullText || fullText.length === 0) {
                    textObj.setText("");
                    if (onComplete) {
                        onComplete();
                    }
                    return;
                }

                textObj.setText(fullText);

                const bounds = textObj.getTextBounds().global;
                const totalChars = fullText.length;
                const totalWidth = bounds.width;
                const totalHeight = bounds.height;

                if (totalChars <= 1 || totalWidth <= 0 || totalHeight <= 0) {
                    if (onComplete) {
                        onComplete();
                    }
                    return;
                }

                const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
                this._typingMaskGraphics.push(maskGraphics);

                const updateMask = (visibleChars) => {
                    const revealWidth = (visibleChars / totalChars) * totalWidth;
                    maskGraphics.clear();
                    maskGraphics.fillStyle(0xffffff, 1);
                    maskGraphics.fillRect(bounds.x, bounds.y, revealWidth, totalHeight);
                };

                let visibleChars = 1;
                updateMask(visibleChars);
                textObj.setMask(maskGraphics.createGeometryMask());

                const typeEvent = this.time.addEvent({
                    delay,
                    repeat: totalChars - 2,
                    callback: () => {
                        visibleChars += 1;
                        updateMask(visibleChars);

                        if (visibleChars >= totalChars) {
                            textObj.clearMask();
                            if (maskGraphics && maskGraphics.active) {
                                maskGraphics.destroy();
                            }
                            this._typingMaskGraphics = this._typingMaskGraphics.filter((gfx) => gfx !== maskGraphics);
                            if (onComplete) {
                                onComplete();
                            }
                        }
                    }
                });

                this._typingEvents.push(typeEvent);
            };

            this.setNarrator = function(t1, t2) {
                    this._typingRunId += 1;
                    const runId = this._typingRunId;
                    this._clearTypingEvents();
                    this.line1.setText("");
                    this.line2.setText("");
                    this._typeLine(this.line1, t1, 28, () => {
                        if (runId !== this._typingRunId) {
                            return;
                        }
                        this._typeLine(this.line2, t2, 28);
                    });
            };

            this.events.on("shutdown", () => {
                this._clearTypingEvents();
            });
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
        customEmitter.on("LPFIRED", this.setNarrator.bind(this,"Push forward! Vanquish the evil snakes!","Find the gate. Press Z to enter it."))
        customEmitter.on("SNAKEBOSS_BEGIN", this.setNarrator.bind(this,"Avoid the orbs shot by the robot","Use your Cyber Canon and Plasma Saber."))
        customEmitter.on("L2BEGIN", this.setNarrator.bind(this,"Navigate the rough terrain.","Viruses are tougher and smarter than snakes, push through!"))
        customEmitter.on("DRAGONBOSS", this.setNarrator.bind(this,"Defeat the flying robot!","Don't give in!"))
        customEmitter.on("DRAGONBOSS_CLEAR", this.setNarrator.bind(this,"",""))
        customEmitter.on("boss_transition", this.setNarrator.bind(this,"He is not defeated?",""))
        customEmitter.on("stage_1_defeat", onBeatS1.bind(this))
        
    function onJump(){
        if (playerData.didJump){
            return;
        }
            this.setNarrator("Push forward! Vanquish the evil snakes!","Press SPACE to use your Plasma Saber.");
            playerData.didJump = true;
        }
    function onBeatS1(){
        if (playerData.didBeatS1){
            return;
        }
            this.setNarrator("Nice job beating the mighty robot!","Time to move on...");
            playerData.didBeatS1 = true;
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
