import * as Phaser from "phaser";
import { setupSceneFade, fadeToScene } from "./Functions/sceneFade.js";

export default class CarSfIntro extends Phaser.Scene {
  constructor() {
    super({ key: "CarSfIntro" });
  }

  preload() {
    this.load.image("car_sf_intro", "public/assets/car_sf_intro.png");
    this.load.bitmapFont("arcade_font", "public/assets/PressStart.png", "public/assets/PressStart.xml");
  }

  create() {
    this._isExiting = false;
    const { width, height } = this.scale;

    const stopSharedIfPlaying = (musicRef) => {
      if (musicRef && musicRef.isPlaying) {
        musicRef.stop();
      }
    };
    stopSharedIfPlaying(this.game.__sharedScaryMusic);
    stopSharedIfPlaying(this.game.__sharedBackgroundMusic);
    stopSharedIfPlaying(this.game.__sharedLevelMusic);
    stopSharedIfPlaying(this.game.__sharedBossMusic);
    this.music = null;

    this.add
      .image(0, 0, "car_sf_intro")
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    this.promptText = this.add
      .bitmapText(width - 8, 8, "arcade_font", "PRESS ANY KEY TO CONTINUE", 8)
      .setOrigin(1, 0)
      .setDepth(10);
    this.promptText.setVisible(false);

    setupSceneFade(this, { pauseGameplay: false, duration: 400 });

    this._promptDelayEvent = this.time.delayedCall(2000, () => {
      this.promptText.setVisible(true);
      this._promptBlinkEvent = this.time.addEvent({
        delay: 750,
        loop: true,
        callback: () => {
          this.promptText.setVisible(!this.promptText.visible);
        }
      });
    });

    this.input.keyboard.once("keydown", () => {
      if (this._isExiting) {
        return;
      }
      this._isExiting = true;

      if (this._promptDelayEvent) {
        this._promptDelayEvent.remove(false);
      }
      if (this._promptBlinkEvent) {
        this._promptBlinkEvent.remove(false);
      }

      fadeToScene(this, "arcade_exterior", undefined, 250);
    });
  }
}
