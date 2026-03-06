  const fireProjectile = function (time) {
    this.projectileOnCooldown = true;
    this.projectileCooldownStart = time;

    this.lastFiredTime = time;
    const proj = this.add.rectangle(this.player.x, this.player.y, 10, 10, 0x00ffff);
    this.physics.add.existing(proj);
    this.playerProjectiles.add(proj); // Use separate group!

    proj.body.allowGravity = false;
    const velocity = this.player.flipX ? -400 : 400;
    proj.body.setVelocityX(velocity);

    // auto destroy
    this.time.delayedCall(2000, () => {
      if (proj.active) proj.destroy();
    });

    // Add collision with enemies
    this.physics.add.overlap(proj, this.enemies, (projectile, enemy) => {
      if (enemy.hitCooldown) {
        projectile.destroy();
        return;
      }
      enemy.hitCooldown = true;
      projectile.destroy();

      enemy.hp -= this.projectileDamage;

      if (enemy.hp <= 0) {
        enemy.destroy();
      } else {
        // Flash white
        enemy.setTintFill(0xffffff);

        enemy.isKnockedBack = true;
        // projectile direction
        const kbDir = (projectile.body.velocity.x > 0) ? 1 : -1;
        enemy.setVelocity(kbDir * this.knockbackSpeedX, -this.knockbackSpeedY);

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
      }
    });
    // hit wall
    this.physics.add.collider(proj, this.ground, () => {
      proj.destroy();
    });
  }
  export default fireProjectile;