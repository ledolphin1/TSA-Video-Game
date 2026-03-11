import * as Phaser from "phaser";
  export const updatePlayerHitboxUnbound = function() {
    if (!this.player || !this.player.body) return;

    const pWidth = this.playerHitbox.width;
    const pHeight = this.playerHitbox.height;

    // Recalculate offset based on CURRENT sprite dimensions
    const pOffsetX = (this.player.width - pWidth) / 2;
    // Align to center instead of bottom to handle varying sprite canvas sizes (16x16 vs 64x64)
    // +1 ensures we match the original 16x16 idle offset (which was 2px)
    const pOffsetY = ((this.player.height - pHeight) / 2) + 1;

    this.player.body.setSize(pWidth, pHeight);
    this.player.body.setOffset(pOffsetX, pOffsetY);
  }



  export const flashPlayerUnbound = function() {
    this.tweens.add({
      targets: this.playerVisual,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.playerVisual.alpha = 1;
        this.isInvincible = false;
      }
    });
  }

    export const killPlayerUnbound = function() {
    if (this.playerIsDead) return;
    this.playerIsDead = true;
    this.isJumping = false

    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0);
    this.player.body.enable = false;
    this.playerVisual.setTint(0xff0000); // Visual feedback for death

    this.time.delayedCall(100, () => {
      this.respawnPlayer();
    });
  }

    export const respawnPlayerUnbound = function() {
    this.health = this.maxHealth;
    this.drawHealthBar();
    this.playerIsDead = false;
    this.isInvincible = false;
    // Reset Player Position and Physics
    this.playerVisual.clearTint();
    this.playerVisual.setTexture("player_still"); // Reset animation to idle
    this.player.enableBody(true, 270, 888, true, false); // Reset to start pos, keep hidden
    this.playerVisual.setAlpha(1);
    this.player.setVelocity(0, 0);
    this.lastFiredTime = 0;
    this.isAttacking = false;
  }