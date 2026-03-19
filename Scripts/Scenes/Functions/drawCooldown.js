import * as Phaser from "phaser";
 const drawCooldown = function(progress, slot = 1) {
    let g = slot === 1 ? this.cooldownGraphic : (this.cooldown2Graphic || this.cooldownGraphic);
    let y = slot === 1 ? this.cooldownY : (this.cooldown2Y || this.cooldownY);

    g.clear();

    if (progress >= 1) {
      g.setVisible(false);
      return;
    }

    g.setVisible(true);
    g.fillStyle(0x00ffff, 1);
    g.beginPath();
    g.moveTo(this.cooldownX, y);

    g.arc(
      this.cooldownX,
      y,
      this.cooldownRadius,
      Phaser.Math.DegToRad(-90),
      Phaser.Math.DegToRad(-90 + 360 * (1 - progress)),
      false
    );

    g.closePath();
    g.fillPath();
  }
  export default drawCooldown