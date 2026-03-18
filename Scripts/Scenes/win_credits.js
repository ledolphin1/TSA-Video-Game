import * as Phaser from "phaser";
import { playerData } from "./playerdata.js";
import { setupSceneFade } from "./Functions/sceneFade.js";

export default class WinCredits extends Phaser.Scene {
  constructor() {
    super({ key: "WinCredits" });
  }

  preload() {
    this.load.bitmapFont("arcade_font", "public/assets/PressStart.png", "public/assets/PressStart.xml");
  }

  create() {
    setupSceneFade(this, { pauseGameplay: false, duration: 350 });

    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setOrigin(0.5);

    this.winText = this.add
      .bitmapText(width / 2, height / 2 - 5, "arcade_font", "YOU WIN", 24)
      .setOrigin(0.5)
      .setTint(0xfff27a);

    this.scrollContainer = this.add.container(width / 2, height + 60);

    const statLines = [
      "RUN STATS",
      `Enemy Kills: ${playerData.stats.enemyKills}`,
      `Damage Taken: ${playerData.stats.damageTaken}`,
      `Deaths: ${playerData.stats.deaths}`,
      `Projectiles Fired: ${playerData.stats.projectilesFired}`,
      `Melee Attacks: ${playerData.stats.meleeAttacks}`
    ];

    let y = 0;
    statLines.forEach((line, idx) => {
      const text = this.add
        .bitmapText(0, y, "arcade_font", line, idx === 0 ? 12 : 9)
        .setOrigin(0.5, 0)
        .setTint(idx === 0 ? 0x9fe8ff : 0xffffff);
      this.scrollContainer.add(text);
      y += idx === 0 ? 22 : 16;
    });

    this.gameOverText = this.add
      .bitmapText(width / 2, height + 220, "arcade_font", "GAME OVER", 24)
      .setOrigin(0.5)
      .setTint(0xff8080);

    this._flashCount = 0;
    this._flashEvent = this.time.addEvent({
      delay: 380,
      loop: true,
      callback: () => {
        this.winText.setVisible(!this.winText.visible);
        this._flashCount += 1;

        if (this._flashCount >= 6) {
          this._flashEvent.remove(false);
          this.winText.setVisible(true);
          this._startCreditsScroll();
        }
      }
    });
  }

  _startCreditsScroll() {
    const { height } = this.scale;

    this.tweens.add({
      targets: [this.winText, this.scrollContainer, this.gameOverText],
      y: "-=520",
      duration: 28000,
      ease: "Linear",
      onUpdate: () => {
        if (this.gameOverText.y <= height / 2) {
          this.winText.y = -2000;
          this.scrollContainer.y = -2000;
          this.gameOverText.y = height / 2;
          this.tweens.killAll();
        }
      }
    });
  }
}
