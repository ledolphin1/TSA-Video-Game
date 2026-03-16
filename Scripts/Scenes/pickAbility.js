import * as Phaser from "phaser";
import { playerData } from "./playerdata";

export default class pickAbility extends Phaser.Scene {
  constructor() {
    super({ key: "pickAbility" });
  }
   init(data) {
    this.returnScene = data.returnScene;
  }

  preload() {
    this.load.bitmapFont("arcade_font", "public/assets/PressStart.png", "public/assets/PressStart.xml");
    this.load.bitmapFont("game_font", "public/assets/pixel_fonts/fonts/square_6x6.png", "public/assets/pixel_fonts/fonts/square_6x6.xml")
    this.load.image('poison_card',"public/assets/poison_card.png")
    this.load.image('hyper_card',"public/assets/hyper_card.png")
    this.load.image('wave_card',"public/assets/wave_card.png")
    
  }
  create() {
    const { width, height } = this.scale;
    // Title text
    // this.add.bitmapText(width/2, 20, "arcade_font","Pick your power")
    this.wv = this.add.image(20,40,"wave_card").setOrigin(0,0).setInteractive({ useHandCursor: true });
    this. ps =this.add.image(width - 20,40,"poison_card").setOrigin(1,0).setInteractive({ useHandCursor: true });
    this.hyp =this.add.image(width/2,80,"hyper_card").setOrigin(0.5,0).setInteractive({ useHandCursor: true });
    this.wv.on("pointerdown", () => {
      playerData.weapon = "wave";
      this.scene.resume(this.returnScene);
      this.scene.stop()
    });
    this.ps.on("pointerdown", () => {
      playerData.weapon = "poison";
      this.scene.resume(this.returnScene);
      this.scene.stop()
    });
    this.hyp.on("pointerdown", () => {
      playerData.weapon = "hyper";
      this.scene.resume(this.returnScene);
      this.scene.stop()
    });
    
  }
}
