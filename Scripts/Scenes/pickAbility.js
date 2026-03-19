import * as Phaser from "phaser";
import { playerData } from "./playerdata.js";
import { customEmitter } from "./events.js";
export default class pickAbility extends Phaser.Scene {
  constructor() {
    super({ key: "pickAbility" });
  }
   init(data) {
    this.returnScene = data.returnScene;
  }

  preload() {
    customEmitter.emit("pickAbility")
    this.load.image("bg","public/assets/pickAbilityBG.png")
    this.load.image('wave',"public/assets/wave.png")
    this.load.image('hyper',"public/assets/high-power-proj.png")
    this.load.image('poison',"public/assets/poison_proj.png")
    this.load.bitmapFont("arcade_font", "public/assets/PressStart.png", "public/assets/PressStart.xml");
    this.load.bitmapFont("game_font", "public/assets/pixel_fonts/fonts/square_6x6.png", "public/assets/pixel_fonts/fonts/square_6x6.xml")
    this.load.image('poison_card',"public/assets/poison_card.png")
    this.load.image('hyper_card',"public/assets/hyper_card.png")
    this.load.image('wave_card',"public/assets/wave_card.png")
    
  }
  create() {
    this.scene.bringToTop("Narator")
    console.log("Should narrate")
    const { width, height } = this.scale;
    // Title text
    this.add.image(width/2,height/2,"bg").setScale(10)
    this.card = this.add.image(134,height/2+20).setOrigin(0,0.5).setScale(2)
    if (!playerData.weapons.includes("poison")){
    this. ps =this.add.image(25,90,"poison").setOrigin(0,0).setInteractive({ useHandCursor: true }).setScale(2);
    this.ps.on("pointerover", () => {
      this.card.setTexture("poison_card")
      this.ps.setTint(0xffbb00);
    })
    this.ps.on("pointerout", () => {
      this.ps.clearTint();
    })
    this.ps.on("pointerdown", () => {
      playerData.weapon = "poison";
      playerData.weapons.push("poison")
      customEmitter.emit("CHESTOPEN")
      playerData.isAbleToUseEMenu = true;
      this.scene.resume(this.returnScene);
      this.scene.stop()
    });
  }
  if (!playerData.weapons.includes("hyper")){
    this.hyp =this.add.image(62,140,"hyper").setOrigin(0,0).setInteractive({ useHandCursor: true }).setScale(2);
    this.hyp.on("pointerover", () => {
      this.card.setTexture("hyper_card")
      this.hyp.setTint(0xbbff00);
    })
    this.hyp.on("pointerout", () => {
      this.hyp.clearTint();
    })
    this.hyp.on("pointerdown", () => {
      playerData.weapon = "hyper";
      playerData.weapons.push("hyper")
      customEmitter.emit("CHESTOPEN")
      playerData.isAbleToUseEMenu = true;
      this.scene.resume(this.returnScene);
      this.scene.stop()
    });
  }
  if (!playerData.weapons.includes("wave")){
    this.wv = this.add.image(57,40,"wave").setOrigin(0,0).setInteractive({ useHandCursor: true });
    this.wv.on("pointerover", () => {
      this.card.setTexture("wave_card")
      this.wv.setTint(0xffbb00);
    })
    this.wv.on("pointerout", () => {
      this.wv.clearTint();
    })
    this.wv.on("pointerdown", () => {
      playerData.weapon = "wave";
      playerData.weapons.push("wave")
      customEmitter.emit("CHESTOPEN")
      playerData.isAbleToUseEMenu = true;
      this.scene.resume(this.returnScene);
      this.scene.stop()
    });
  }
  }
}
