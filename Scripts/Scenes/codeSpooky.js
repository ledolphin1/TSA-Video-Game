import * as Phaser from "phaser";
import { setupSceneFade, fadeToScene } from "./Functions/sceneFade.js";
import { customEmitter } from "./events.js";

export default class codeSpooky extends Phaser.Scene {
  constructor() {
    super({ key: "codeSpooky" });
  }

  preload() {
    customEmitter.emit("codespooky")
    this.load.image("codespooky", "public/assets/codeSpooky.png");
    this.load.bitmapFont("arcade_font", "public/assets/PressStart.png", "public/assets/PressStart.xml");
    this.load.audio("scary", "public/assets/audio/scary.mp3");
  }

  create() {
    this._isExiting = false;
    const { width, height } = this.scale;

    const stopSharedIfPlaying = (musicRef) => {
      if (musicRef && musicRef.isPlaying) {
        musicRef.stop();
      }
    };
    stopSharedIfPlaying(this.game.__sharedBackgroundMusic);
    stopSharedIfPlaying(this.game.__sharedLevelMusic);
    stopSharedIfPlaying(this.game.__sharedBossMusic);

    let music = this.game.__sharedScaryMusic;
    if (!music || music.key !== "scary" || music.manager !== this.sound) {
      music = this.sound.add("scary", {
        loop: true,
        volume: 0.3
      });
      this.game.__sharedScaryMusic = music;
    }
    music.loop = true;
    music.volume = 0.3;
    if (!music.isPlaying) {
      music.play();
    }
    this.music = music;

    this.add
      .image(0, 0, "codespooky")
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

      fadeToScene(this, "MainScene", undefined, 250);
    });
  }
}
