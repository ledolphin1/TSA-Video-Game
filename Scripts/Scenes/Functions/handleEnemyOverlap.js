  const handleEnemyOverlap = function(player, enemy) {
    if (this.playerIsDead || this.isInvincible) return;
    if (enemy.isKnockedBack) return; // enemy cannot hurt player while stunned

    // Common Damage Logic
    this.health--;
    this.drawHealthBar();

    // Super Armor Case: attacking players don't freeze or get knocked back
    if (this.isAttacking) {
      this.isInvincible = true;
      if (this.health <= 0) {
        this.killPlayer();
      } else {
        this.flashPlayer();
      }
      return;
    }

    // Normal Case: Hitstop (Freezeframe) then Knockback
    this.physics.world.pause();
    this.anims.pauseAll();
    this.isInvincible = true; // Lock collisions during freeze

    // Use setTimeout to ignore engine time scale effectively
    setTimeout(() => {
      this.physics.world.resume();
      this.anims.resumeAll();

      if (this.health <= 0) {
        this.killPlayer();
      } else {
        // Apply Knockback
        this.isKnockedBack = true;

        const knockbackDirection = (this.player.x < enemy.x) ? -1 : 1;
        this.player.setVelocity(knockbackDirection * 100, -50);

        // Lock controls for short duration
        this.time.delayedCall(250, () => {
          this.isKnockedBack = false;
        });

        this.flashPlayer();
      }
    }, 150); // 150ms freeze duration
  }
  export default handleEnemyOverlap;