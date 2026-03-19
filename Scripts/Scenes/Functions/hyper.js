  import { playerData } from "../playerdata.js";
  const hyper = function (time, slot = 1) {
    this.sound.play("projectilesound", { seek: 0.2 });
    if (slot === 1) {
      this.projectileOnCooldown = true;
      this.projectileCooldownStart = time;
      this.lastFiredTime = time;
    } else {
      this.secondaryOnCooldown = true;
      this.secondaryCooldownStart = time;
      this.lastSecondaryFiredTime = time;
    }
    playerData.stats.projectilesFired += 1;
    const proj = this.physics.add.sprite(this.player.x,this.player.y,"hyper");
    proj.flipX = this.player.flipX ? true : false;
    this.physics.add.existing(proj);
    this.playerProjectiles.add(proj); // Use separate group!

    const velocity = this.player.flipX ? -400 : 400;
    proj.body.allowGravity = false;
    proj.body.setVelocityX(velocity);

    // auto destroy
    this.time.delayedCall(2000, () => {
      if (proj.active) proj.destroy();
    });

    // Add collision with enemies
    this.physics.add.overlap(proj, this.enemies, (projectile, enemy) => {
      this.projectileEnemyCollisionHandle(projectile,enemy, 5)
      projectile.destroy()
    });
    this.physics.add.overlap(proj, this.dragon, (projectile,enemy) => {
      this.projectileEnemyCollisionHandle(projectile,enemy, 5)
      projectile.destroy()
    });
   
    // hit wall
    this.physics.add.collider(proj, this.ground, (projectile) => {
      projectile.destroy();
    });
  }
  export default hyper;