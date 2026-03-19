    import { playerData } from "../playerdata.js";
  const waveProj = function (time) {
        this.sound.play("projectilesound", { seek: 0.2 });
    this.projectileOnCooldown = true;
    this.projectileCooldownStart = time;
    this.waveAttackDmg = 3;
    this.lastFiredTime = time;
        playerData.stats.projectilesFired += 1;
    const proj = this.physics.add.sprite(this.player.x,this.player.y,"wave").setData("enemies_pierced",0);
    proj.flipX = this.player.flipX ? true : false;
    this.physics.add.existing(proj);
    this.playerProjectiles.add(proj); // Use separate group!
    proj.enemiesColided = [];

    const velocity = this.player.flipX ? -400 : 400;
    proj.body.allowGravity = false;
    proj.body.setVelocityX(velocity);
    proj.spawnimmunity = 2;
    const opacityInterval = setInterval(function(){
        if (proj.spawnimmunity){
            proj.spawnimmunity--;
            return;
        }
        proj.setAlpha(proj.alpha - 0.25)
        if (proj.alpha == 0){
            proj.destroy();
            clearInterval(opacityInterval);
            console.log("i shouldn't come more than once")
            return;
        }
    }.bind(this),50)
    // Add collision with enemies
    this.physics.add.overlap(proj, this.enemies, (projectile, enemy) => {
        if(projectile.enemiesColided.includes(enemy)){
            return
        }
        projectile.enemiesColided.push(enemy);
        console.log("this happened")
        this.projectileEnemyCollisionHandle(projectile,enemy,this.waveAttackDmg)
    });
    this.physics.add.overlap(proj, this.dragon, (projectile,enemy) => {
    if(projectile.enemiesColided.includes(enemy)){
            return
        }
        projectile.enemiesColided.push(enemy);
        console.log("this happened")
        this.projectileEnemyCollisionHandle(projectile,enemy,this.waveAttackDmg)
    });
   
  }
  export default waveProj;