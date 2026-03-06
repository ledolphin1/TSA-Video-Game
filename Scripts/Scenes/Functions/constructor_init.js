const constructor_init = function (){
    
    //Health & State
    this.maxHealth = 5;
    this.health = this.maxHealth;
    
    this.isInvincible = false;
    this.playerIsDead = false;
    this.isAttacking = false;
    this.isKnockedBack = false;
    
    //Combat
    this.slashDamage = 1;
    this.projectileDamage = 2;
    
    this.knockbackSpeedX = 100;
    this.knockbackSpeedY = 67;
    
    this.lastAttackEndTime = 0;
    
    //Hitboxes
    // Offsets are auto-calculated to center
    this.playerHitbox = {
      width: 10,
      height: 14
    };
    
    this.enemyHitbox = {
      width: 18.5,
      height: 9
    };
    
    //Visual Offsets
    // Positive X → shift sprite right
    // Positive Y → shift sprite down
    this.attackVisualOffset = {
      x: 9,
      y: -8
    };
  
    
    
    this.projectileCooldown = 3000;
    this.projectileOnCooldown = false;
    this.projectileCooldownStart = 999999;
    
}
export default constructor_init;