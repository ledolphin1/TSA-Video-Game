  import { playerData } from "../playerdata.js";
  const fireProjectile = function (time) {
    this.sound.play("projectilesound", { seek: 0.2 });
    this.projectileOnCooldown = true;
    this.projectileCooldownStart = time;

    this.lastFiredTime = time;
    playerData.stats.projectilesFired += 1;
    const proj = this.physics.add.sprite(this.player.x,this.player.y,"lpProjectile");
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
      console.log(projectile.body)
      this.projectileEnemyCollisionHandle(projectile,enemy,this.projectileDamage)
      projectile.destroy()
    });
    // hit wall
    this.physics.add.collider(proj, this.ground, () => {
      proj.destroy();
    });
  }
  export default fireProjectile;