import * as Phaser from "phaser";
 const drawCooldown = function(progress) {
    this.cooldownGraphic.clear();

    if (progress >= 1) {
      this.cooldownGraphic.setVisible(false);
      return;
    }

    this.cooldownGraphic.setVisible(true);

    this.cooldownGraphic.fillStyle(0x00ffff, 1);

    this.cooldownGraphic.beginPath();
    this.cooldownGraphic.moveTo(this.cooldownX, this.cooldownY);

    this.cooldownGraphic.arc(
      this.cooldownX,
      this.cooldownY,
      this.cooldownRadius,
      Phaser.Math.DegToRad(-90),
      Phaser.Math.DegToRad(-90 + 360 * (1 - progress)),
      false
    );

    this.cooldownGraphic.closePath();
    this.cooldownGraphic.fillPath();
  }
  export default drawCooldown