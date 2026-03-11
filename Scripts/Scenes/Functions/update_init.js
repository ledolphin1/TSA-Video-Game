import * as Phaser from "phaser";
const updateInit = function(time){
       if (this.playerIsDead) return; // prevent movement while dead
    if (this.isKnockedBack) return; // prevent movement while applying knockback force

    if (this.projectileOnCooldown) {
      const elapsed = time - this.projectileCooldownStart;
      const progress = Phaser.Math.Clamp(elapsed / this.projectileCooldown, 0, 1);

      this.drawCooldown(progress);

      if (progress >= 1) {
        this.projectileOnCooldown = false;
      }
    }

    // Update Enemies
    this.enemies.children.iterate((enemy) => {
      this.updateEnemy(enemy);
    });

    //switched onGround to a property (just in case)
    this.onGround = this.player.body.blocked.down;
    if (this.onGround) {
      this.isJumping = false
      this.lastGroundedTime = time;
    }
    if (this.player.body.velocity.y > 0 && !this.isAttacking) {
      this.playerVisual.play("player_falling", true)
    }
    // Attack Input
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking && time > this.lastAttackEndTime + 10) {
      this.performAttack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
      this.scene.pause()
      this.scene.launch("Pause", { returnScene: this.scene.key });
    }

    // Ranged Attack Input
    if (Phaser.Input.Keyboard.JustDown(this.fireKey) && !this.projectileOnCooldown) {
      if (time > this.lastFiredTime + 3000) { // 3s cooldown
        this.fireProjectile(time);
      }
    }

    if (this.isAttacking) return;

    // Left/Right Movement

    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      if (this.onGround) {
        this.playerVisual.play("player_moving", true)
      }
      this.player.setVelocityX(-150);



    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      if (this.onGround) {
        this.playerVisual.play("player_moving", true)
      }
      this.player.setVelocityX(150);

    } else {
      this.player.setVelocityX(0);
      if (this.onGround) {
        this.playerVisual.setTexture("player_still")
      }
    }

    // Jumping
    if (this.cursors.up.isDown && (this.onGround || (time - this.lastGroundedTime < 100))) {
      this.player.setVelocityY(-300);
      this.lastGroundedTime = 0;
      this.isJumping = true;
      this.playerVisual.play("player_jump_start", true);
    }

    // Variable jump height: cut velocity when button is released
    if (Phaser.Input.Keyboard.JustUp(this.cursors.up) && this.player.body.velocity.y < 0) {
      this.player.setVelocityY(this.player.body.velocity.y * 0.5);
    }

    // Update Coordinate Display
    this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);
}
export default updateInit;