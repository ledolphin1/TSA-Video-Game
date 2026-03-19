  import { playerData } from "../playerdata.js";
  const poison = function (time) {
    this.sound.play("projectilesound", { seek: 0.2 });
    this.projectileOnCooldown = true;
    this.projectileCooldownStart = time;

    this.lastFiredTime = time;
    playerData.stats.projectilesFired += 1;
    const proj = this.physics.add.sprite(this.player.x,this.player.y,"poison");
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
      this.projectileEnemyCollisionHandle(projectile,enemy, 1)
        if(!enemy.poisoCount){
          enemy.poisoCount = 0;
        }
        if (!enemy.isPoisoned){
            enemy.poison = this.time.addEvent(
              {
                delay: 1000,
                callback: () => {
                if (enemy.poisoCount == 5){
                    enemy.isPoisoned = false;
                    enemy.poisoCount = 0;
                    console.log("no more poison")
                    enemy.clearTint();
                    enemy.poison.remove();
                    return;
                }
                this.projectileEnemyCollisionHandle(projectile,enemy,1,1)
                enemy.poisoCount++;
            },
              callbackScope:this,
              loop: true

          });
        }
        projectile.destroy()
        enemy.isPoisoned = true;
    });
    
   
    this.physics.add.overlap(proj, this.dragon, (projectile, enemy) => {
      this.projectileEnemyCollisionHandle(projectile,enemy, 1)
      
      if(!enemy.poisoCount){
          enemy.poisoCount = 0;
        }
        if (!enemy.isPoisoned){
          
            enemy.poison = this.time.addEvent(
              {
                delay: 1000,
                callback: () => {
                if (enemy.poisoCount == 5){
                    enemy.isPoisoned = false;
                    enemy.poisoCount = 0;
                    console.log("no more poison")
                    enemy.clearTint();
                    enemy.poison.remove();
                    return;
                }
                this.projectileEnemyCollisionHandle(projectile,enemy,1,1)
                enemy.poisoCount++;
            },
              callbackScope:this,
              loop: true

          });
        
        }
        projectile.destroy()
        enemy.isPoisoned = true;
    });
    
   
    // hit wall
    this.physics.add.collider(proj, this.ground, (projectile) => {
      projectile.destroy();
    });
  }
  export default poison;