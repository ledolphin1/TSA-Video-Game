import * as Phaser from "phaser";
import { playerData } from "./playerdata.js";
import { setupSceneFade, fadeToScene } from "./Functions/sceneFade.js";
export default class Intro extends Phaser.Scene {
  constructor() {
    super({ key: "Intro" });
  }
  preload() {
    this.load.video("intro_vid", "public/assets/Intro.mp4", true)
    
    this.load.bitmapFont("arcade_font", "public/assets/PressStart.png", "public/assets/PressStart.xml")

  }
  create() {
    setupSceneFade(this, { pauseGameplay: false, duration: 350 });
    console.log(playerData);
    
    const video = this.add.video(0, 0, "intro_vid");
    video.setOrigin(0, 0)
    video.play(false);
    video.on("complete", () => {
      fadeToScene(this, "Menu");
    });

    this.cameras.main.roundPixels = true;
    // Skip Button
    const skipText = this.add.bitmapText(this.cameras.main.width - 20, 20, "arcade_font", "SKIP", 8).setOrigin(1, 0).setInteractive({ cursor: "pointer" })

    skipText.on("pointerover", () => {
      skipText.setTint("0xFFFF00");
    })

    skipText.on("pointerout", () => {
      skipText.setTint("0xFFFFFF");
    })

    skipText.on("pointerdown", () => {
      fadeToScene(this, "Menu");
    });

    // Keyboard Skip
    this.input.keyboard.on("keydown-SPACE", () => {
      fadeToScene(this, "Menu");
    });
    this.input.keyboard.on("keydown-ENTER", () => {
      fadeToScene(this, "Menu");
    });
  }
}
