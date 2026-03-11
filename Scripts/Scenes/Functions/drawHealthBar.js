import * as Phaser from "phaser";
const drawHealthBar = function () {
    const healthPercent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);

    this.healthBarBg.clear();
    this.healthBarFill.clear();

    this.healthBarBg.lineStyle(2, 0xffffff);
    this.healthBarBg.strokeRect(
      this.healthBarX,
      this.healthBarY,
      this.healthBarWidth,
      this.healthBarHeight
    );

    this.healthBarFill.fillStyle(0x00ff00);
    this.healthBarFill.fillRect(
      this.healthBarX + 2,
      this.healthBarY + 2,
      (this.healthBarWidth - 4) * healthPercent,
      this.healthBarHeight - 4
    );
  }
  export default drawHealthBar;