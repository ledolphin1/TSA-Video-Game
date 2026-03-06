  import Phaser from "phaser";
  
  const performAttack = function() {
    this.isJumping = false;//!
    this.isAttacking = true;//!
    this.player.setVelocityX(0); // Stop horizontal movement//!
    this.player.setVelocityY(0); // Stop vertical movement//!
    this.player.body.allowGravity = false; // Disable gravity//!

    // Force immediate hitbox adjustment for the new animation frame
    this.time.delayedCall(1, () => {//!
      this.updatePlayerHitbox();//!
    });//!

    // Calculate hitbox position based on facing direction
    const offsetX = this.player.flipX ? -20 : 20; // Left or Right
    const startX = this.player.x + offsetX;
    const startY = this.player.y;
    // Create a temporary hitbox for the attack
    // Using a clear sprite or zone. For debug visibility we can use a small colored sprite or just a physics body.
    // We'll use a physics sprite without texture (invisible) but debug body visible.
    const attackHitbox = this.physics.add.sprite(startX, startY, null);
    attackHitbox.body.setSize(30, 25);
    attackHitbox.setVisible(false); // Invisible sprite
    attackHitbox.body.allowGravity = false;
    attackHitbox.body.debugBodyColor = 0xffff00; // Yellow for attack
    this.playerVisual.play("player_attack", true);

    // Check overlap with enemies
    this.physics.add.overlap(attackHitbox, this.enemies, (hitbox, enemy) => {
      if (enemy.hitCooldown) return;
      enemy.hitCooldown = true;

      this.playerVisual.play("player_attack", true);

      // -- INSTANT HIT PROCESSING --
      enemy.hp -= this.slashDamage;

      if (enemy.hp <= 0) {
        enemy.destroy();
        this.physics.world.pause();
        this.anims.pauseAll();
        setTimeout(() => {
          this.physics.world.resume();
          this.anims.resumeAll();
        }, 100);
        return;
      }

      // Flash white
      enemy.setTintFill(0xffffff);

      // Apply Knockback
      enemy.isKnockedBack = true;
      const kbDir = this.player.flipX ? -1 : 1;
      enemy.setVelocity(kbDir * this.knockbackSpeedX, -this.knockbackSpeedY);

      // Hitstop effect
      this.physics.world.pause();
      this.anims.pauseAll();

      // Resume Game Loop after freeze
      setTimeout(() => {
        this.physics.world.resume();
        this.anims.resumeAll();
      }, 100);

      // Reset Enemy State
      setTimeout(() => {
        if (enemy.active) {
          enemy.clearTint();
          enemy.isKnockedBack = false;
          enemy.hitCooldown = false;

          // Face Player and Move
          const recoverDir = (this.player.x < enemy.x) ? -1 : 1;
          enemy.setVelocityX(recoverDir * 50);
          enemy.flipX = (recoverDir === 1);
        }
      }, 400);
    });

    // Remove hitbox after short duration
    this.time.delayedCall(100, () => {
      attackHitbox.destroy();
    });

    // Reset attack state after fixed duration (independent of animation)
    this.time.delayedCall(250, () => {
      this.isAttacking = false;
      this.lastAttackEndTime = this.time.now;
      this.player.body.allowGravity = true; // Restore gravity
      this.updatePlayerHitbox(); // Reset hitbox for normal sprite
    });
  }
export default performAttack;