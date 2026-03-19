import * as Phaser from "phaser";
import create_init from "./Functions/create_init.js";
import activate_anims from "./Functions/activate_anims.js";
import constructor_init from "./Functions/constructor_init.js";
import preload_init from "./Functions/preload_init.js";
import { customEmitter } from "./events.js";
import { playerData } from "./playerdata.js";
import { fadeToScene } from "./Functions/sceneFade.js";


//  Enemies are brute robot/virus thingies that chase the player.
//    4 HP (4 melee hits, or 2 ranged hits)
//    When adjacent to player: pause 250 ms → swing electro blade → 2 damage
//  Gateway at the right end: press Z to go to .


export default class LevelTwo extends Phaser.Scene {
  constructor() {
    super({ key: "LevelTwo" });
    constructor_init.call(this);
    // (Don't) Override projectile damage so 2 shots (still) kill the virus (hp=4, proj=2)
    // this.projectileDamage = 4;
  }

  preload() {
    customEmitter.emit("L2BEGIN")
    preload_init.call(this);

    // Virus sprite — 4 frames × 16×16
    this.load.spritesheet("virusEnemy", "public/assets/virusEnemy.png", {
      frameWidth: 16,
      frameHeight: 16
    });

    // Electro blade — 4 frames × 8×8
    this.load.spritesheet("electroBlade", "public/assets/electroBlade.png", {
      frameWidth: 8,
      frameHeight: 8
    });

    // Gateway portal — 4 frames × 32×32

    this.load.image("gate", "public/assets/gate.png");

    this.load.image("spikes", "public/assets/Map/spikes.png");
    this.load.tilemapTiledJSON("leveltwo_map", "public/assets/Map/leveltwo.tmj");
  }

  // ──────────────────────────────────── CREATE ──────────────────────────────
  create() {
    const map = this.make.tilemap({ key: "leveltwo_map" });

    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).on("down", () => {
      if (this.walkingSfx && this.walkingSfx.isPlaying) {
        this.walkingSfx.stop();
      }
      playerData.didBeatL2 = true;
      fadeToScene(this, "overworld");
    });
    // ── Base setup (player, camera, ground, controls, HUD) ──────────────────
    create_init.call(this, map);
        this.add.tileSprite(0,0,map.widthInPixels,map.heightInPixels,"main_bg").setOrigin(0,0).setDepth(-7)
    this.cameras.main.startFollow(this.player, false, 1, 1);//ALWAYS THIS SETTING
    // ── Extra animations ────────────────────────────────────────────────────
    this.anims.create({
      key: "virus_idle",
      frames: this.anims.generateFrameNumbers("virusEnemy", { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: "virus_glitch",
      frames: this.anims.generateFrameNumbers("virusEnemy", { start: 0, end: 3 }),
      frameRate: 30,   // fast flicker = glitch burst
      repeat: 3
    });

    this.anims.create({
      key: "blade_swing",
      frames: this.anims.generateFrameNumbers("electroBlade", { start: 0, end: 3 }),
      frameRate: 20,
      repeat: 0
    });

    // ── Spikes layer ────────────────────────────────────────────────────────
    const spikeTileset = map.addTilesetImage("spikes", "spikes");
    const spikesLayer  = map.createLayer("spikes", spikeTileset);
    spikesLayer.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, spikesLayer, this._handleSpikeOverlap, null, this);

    this._spikesLayer = spikesLayer;

    // ── Enemy group ─────────────────────────────────────────────────────────
    this.enemies = this.physics.add.group();

    // Spawn viruses across the map
    const spawnPoints = [
      { x: 176, y: 240 }, // near start
      { x: 750, y: 240},
      { x: 1000, y: 240 },// near end
      { x: 384, y: 80 },   // upper middle
      { x: 704, y: 80 }, // upper right
      { x: 1072, y: 80 }
    ];
    spawnPoints.forEach(pt => this._spawnVirus(pt.x, pt.y));

    this.physics.add.collider(this.enemies, this.ground);
    this.physics.add.collider(this.enemies, spikesLayer, (enemy) => {
      if (enemy && enemy.active) enemy.destroy();
    });


    // ── Player body vs enemy ─────────────────────────────────────────────────
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (this._isSceneTransitioning) return;
      if (enemy.isAttackingPlayer) return;
      if (this.playerIsDead) return;
      if (this.isInvincible) return;

      this.health -= 1;
      playerData.stats.damageTaken += 1;
      this.health = Math.max(0, this.health);
      this.drawHealthBar();
      this.isInvincible = true;

      if (this.health <= 0) {
        this.die();
        return;
      }

      // Knockback
      const kbDir = (player.x < enemy.x) ? -1 : 1;
      player.setVelocity(kbDir * this.knockbackSpeedX, -this.knockbackSpeedY);
      this.isKnockedBack = true;
      this.time.delayedCall(250, () => { this.isKnockedBack = false; });
      this.flashPlayer();
    });

    // ── Gateway ─────────────────────────────────────────────────────────────
    // tile, column -> 55, 16
    const GATEWAY_X = 928;
    const GATEWAY_Y = 256;

    this.gatewaySprite = this.add.image(GATEWAY_X, GATEWAY_Y, "gate");
    this.gatewaySprite.setDepth(-5);

    // Physics zone for gateway interaction
    this.gatewayZone = this.add.zone(GATEWAY_X, GATEWAY_Y, 28, 28);
    this.physics.world.enable(this.gatewayZone);
    this.gatewayZone.body.allowGravity = false;
    this.gatewayZone.body.immovable = true;

    // ── Gateway "Press Z" prompt ─────────────────────────────────────────────
    this.gatewayPrompt = this.add.text(GATEWAY_X, GATEWAY_Y - 22, "Press Z", {
      fontSize: "6px",
      fill: "#08c7d4"
    }).setOrigin(0.5, 1).setDepth(6);
    this.gatewayPrompt.setVisible(false);

    // ── Interact key ─────────────────────────────────────────────────────────
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // ── Reposition player spawn to map left ──────────────────────────────────
    this.player.x         = 50;
    this.player.y         = 240;
    this.playerVisual.x   = 50;
    this.playerVisual.y   = 240;

    // ── Enemy spawn tracking (for reset on death) ────────────────────────────
    this._enemySpawnPoints = spawnPoints;

    // ── CRT / glitch overlay tween (aesthetic) ───────────────────────────────
    this._glitchTimer = this.time.addEvent({
      delay: 2500,
      loop: true,
      callback: this._doScreenGlitch,
      callbackScope: this
    });
  }
  die() {
    if (this.playerIsDead) return;
    this.playerIsDead = true;
    playerData.stats.deaths += 1;
    this.isJumping    = false;

    this.player.setVelocity(0, 0);
    this.player.body.enable = false;
    this.playerVisual.setTint(0xff0000);

    setTimeout(() => { this.respawn(); }, 250);
  }
respawn() {
  this.health       = this.maxHealth;
  this.playerIsDead = false;
  this.isInvincible = false;
  this.isAttacking  = false;
  this.isKnockedBack = false;

  this.player.body.enable = true;
  this.player.body.reset(50,240);   // reset snaps position AND clears velocity
  this.player.setVelocity(0, 0);

  this.playerVisual.x = 50;
  this.playerVisual.y = 240;
  this.playerVisual.clearTint();
  this.playerVisual.setTexture("player_still");
  this.playerVisual.setAlpha(1);

  this.drawHealthBar();
}

  // ──────────────────────────────────── UPDATE ──────────────────────────────
  update(time, delta) {
    if (this.playerIsDead) {
      this.updateWalkingSfx(false);
      return;
    }
    if (this.isKnockedBack) {
      this.updateWalkingSfx(false);
      return;
    }
    // Cooldown arc
    if (this.projectileOnCooldown) {
      const elapsed  = time - this.projectileCooldownStart;
      const progress = Phaser.Math.Clamp(elapsed / this.projectileCooldown, 0, 1);
      this.drawCooldown(progress);
      if (progress >= 1) this.projectileOnCooldown = false;
    }

    // Update all viruses
    this.enemies.children.iterate(enemy => {
      if (enemy && enemy.active) this._updateVirus(enemy, time);
      if(enemy.isPoisoned){
        enemy.setTintFill(0x00ff00)
      }
    });

    // ── Standard player logic (mirrors mainscene.js) ─────────────────────────
    this.onGround = this.player.body.blocked.down;
    if (this.onGround) {
      this.isJumping = false;
      this.lastGroundedTime = time;
    }

    if (this.player.body.velocity.y > 0 && !this.isAttacking) {
      this.playerVisual.play("player_falling", true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking && time > this.lastAttackEndTime + 10) {
      this.performAttack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
      this.scene.pause();
      this.scene.launch("Pause", { returnScene: this.scene.key });
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.selectAbilityKey)) {
      if (!playerData.isAbleToUseEMenu){
          return;
        }
         this.scene.pause()
         this.scene.launch("playerSelectAbility", { returnScene: this.scene.key });
       }
    if (Phaser.Input.Keyboard.JustDown(this.fireKey) && !this.projectileOnCooldown) {
      if (time > this.lastFiredTime + 3000) {
        this.selectAbility(time);
      }
    }

    if (this.isAttacking) {
      this.updateWalkingSfx(false);
      return;
    }

    // Movement
    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      if (this.onGround) this.playerVisual.play("player_moving", true);
      this.player.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      if (this.onGround) this.playerVisual.play("player_moving", true);
      this.player.setVelocityX(150);
    } else {
      this.player.setVelocityX(0);
      if (this.onGround) this.playerVisual.setTexture("player_still");
    }

    this.updateWalkingSfx(this.onGround && (this.cursors.left.isDown || this.cursors.right.isDown));

    // Jump
    if (this.cursors.up.isDown && (this.onGround || (time - this.lastGroundedTime < 100))) {
      this.sound.play("jump", { volume: 0.125, seek: 0.425 });
      this.player.setVelocityY(-300);
      this.lastGroundedTime = 0;
      this.isJumping = true;
      this.playerVisual.play("player_jump_start", true);
    }
    if (Phaser.Input.Keyboard.JustUp(this.cursors.up) && this.player.body.velocity.y < 0) {
      this.player.setVelocityY(this.player.body.velocity.y * 0.5);
    }

    // Coord display
    this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);

    // ── Gateway proximity check ───────────────────────────────────────────────
    const gatX  = this.gatewayZone.x;
    const gatY  = this.gatewayZone.y;
    const distX = Math.abs(this.player.x - gatX);
    const distY = Math.abs(this.player.y - gatY);
    const nearGateway = distX < 24 && distY < 24;

    this.gatewayPrompt.setVisible(nearGateway);

    if (nearGateway && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this._enterGateway();
    }
  }

  // ──────────────────────────────── VIRUS SPAWNING ──────────────────────────
  _spawnVirus(x, y) {
    const enemy = this.enemies.create(x, y, "virusEnemy");
    enemy.setScale(2);        // scale up for visibility at 16px base size
    enemy.hp = 8;             // 4 melee or 2 ranged to kill
    enemy.isKnockedBack   = false;
    enemy.hitCooldown     = false;
    enemy.isAttackingPlayer = false;  // true during the 250ms pre-swing pause
    enemy.hasSwung        = false;    // ensures one swing per approach
    enemy._swingTimer     = null;

    // Glitch tint cycling state
    enemy._glitchPhase = 0;
    enemy._nextGlitch  = Phaser.Math.Between(800, 2400);
    enemy._glitchAccum = 0;

    enemy.play("virus_idle");

    // Hitbox
    const eW = 10, eH = 12;
    enemy.body.setSize(eW, eH);
    enemy.body.setOffset((enemy.width - eW) / 2, enemy.height - eH);
    enemy.body.debugBodyColor = 0x00ff41;

    enemy.setCollideWorldBounds(true);
    return enemy;
  }

  // ──────────────────────────────── VIRUS AI ────────────────────────────────
  _updateVirus(enemy, time) {
    if (!enemy.body) return;

    // ── Glitch flicker effect ─────────────────────────────────────────────
    enemy._glitchAccum += 16;   // ~1 frame at 60fps
    if (enemy._glitchAccum >= enemy._nextGlitch) {
      enemy._glitchAccum = 0;
      enemy._nextGlitch  = Phaser.Math.Between(3000, 5000);
      this._triggerVirusGlitch(enemy);
    }

    if (enemy.isKnockedBack || enemy.isAttackingPlayer) return;

    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // ── Attack threshold: close enough to swing ───────────────────────────
    // "right in front" = within ~18px horizontally, similar Y level
    const ATTACK_RANGE = 18;
    const VERTICAL_TOL = 20;

    if (Math.abs(dx) <= ATTACK_RANGE && Math.abs(dy) <= VERTICAL_TOL && !enemy.hasSwung) {
      this._beginVirusAttack(enemy);
      return;
    }

    // Reset hasSwung when the player moves away so the virus can attack again
    if (Math.abs(dx) > ATTACK_RANGE + 10) {
      enemy.hasSwung = false;
    }

    // ── Chase player ──────────────────────────────────────────────────────
    // Horizontal tracking: always move toward player
    const SPEED = 55;
    const movingRight = dx > 0;
    const checkX = enemy.body.center.x + (movingRight ? 32 : -32);
    const checkY = enemy.body.center.y;
    const spikeTile = this._spikesLayer.getTileAtWorldXY(checkX, checkY);
    const dangerAhead = spikeTile && spikeTile.index !== -1;

    if (!dangerAhead) {
      if (dx > 0) {
        enemy.setVelocityX(SPEED);
        enemy.flipX = false;
      } else {
        enemy.setVelocityX(-SPEED);
        enemy.flipX = true;
      }
    } else {
      enemy.setVelocityX(0);
    }

    // Wall bounce — only if not near spikes
    if (!dangerAhead) {
      if (enemy.body.blocked.right) enemy.setVelocityX(-SPEED);
      if (enemy.body.blocked.left)  enemy.setVelocityX(SPEED);
    }
  }
   performAttack() {
    playerData.stats.meleeAttacks += 1;
    this.sound.play("swordslash", { volume: 0.135 });
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
      this.playerVisual.play("player_attack", true);
      this._damageVirus(enemy,this.slashDamage)
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
  // ── Virus attack sequence ─────────────────────────────────────────────────
  _beginVirusAttack(enemy) {
    if (!enemy.active) return;
    enemy.isAttackingPlayer = true;
    enemy.hasSwung = true;

    // Stop moving
    enemy.setVelocityX(0);

    // Play fast glitch anim while winding up
    if (enemy.active) enemy.play("virus_glitch", true);

    // 250 ms pause before swing
    this.time.delayedCall(250, () => {
      if (!enemy.active) return;
      this._virusSwing(enemy);
    });
  }

  _virusSwing(enemy) {
    if (!enemy.active) return;

    // Spawn an electro blade sprite as a short-lived hitbox visual
    const bladeOffX = enemy.flipX ? -12 : 12;
    const blade = this.add.sprite(
      enemy.x + bladeOffX,
      enemy.y,
      "electroBlade"
    );
    blade.setScale(2);
    blade.setDepth(15);
    blade.play("blade_swing");

    // Electric tint flash on the virus
    enemy.setTintFill(0x00ffff);
    this.time.delayedCall(80, () => {
      if (enemy.active) enemy.clearTint();
    });

    // Damage player if still in range
    const dx = Math.abs(this.player.x - enemy.x);
    const dy = Math.abs(this.player.y - enemy.y);
    if (dx <= 22 && dy <= 20) {
      if (this._isSceneTransitioning) return;
      if (!this.playerIsDead && !this.isInvincible) {
        this.health -= 2;
        playerData.stats.damageTaken += 2;
        this.health = Math.max(0, this.health);
        this.drawHealthBar();
        this.isInvincible = true;

        if (this.health <= 0) {
          this.die();
        } else {
          // Knockback away from virus
          const kbDir = (this.player.x < enemy.x) ? -1 : 1;
          this.player.setVelocity(kbDir * this.knockbackSpeedX, -this.knockbackSpeedY);
          this.isKnockedBack = true;
          this.time.delayedCall(250, () => { this.isKnockedBack = false; });
          this.flashPlayer();
        }
      }
    }

    // Remove blade visual after animation (~200 ms)
    this.time.delayedCall(200, () => {
      if (blade && blade.active) blade.destroy();
    });

    // Resume virus AI
    this.time.delayedCall(350, () => {
      if (enemy.active) {
        enemy.isAttackingPlayer = false;
        enemy.play("virus_idle", true);
      }
    });
  }

  // ── Glitch visual effect on a virus ───────────────────────────────────────
  _triggerVirusGlitch(enemy) {
    if (!enemy.active) return;
    const glitchCols = [0xff00ff, 0x00ffff, 0xff4444, 0xffff00];
    const col = glitchCols[Phaser.Math.Between(0, 3)];
    enemy.setTintFill(col);

    // Brief horizontal pixel-jitter via x offset
    const origX = enemy.x;
    const jitterAmt = Phaser.Math.Between(1, 3) * (Math.random() < 0.5 ? 1 : -1);
    enemy.x += jitterAmt;

    this.time.delayedCall(120, ()=> {
      if (enemy.active) {
        enemy.clearTint();
        enemy.x = origX;   // snap back
      }
    });
  }

  // ── Periodic screen-level glitch flash ────────────────────────────────────
  _doScreenGlitch() {
    // Flash a very brief coloured rect over the camera
    const rect = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      Phaser.Math.Between(1, 4),
      0x00ff41,
      0.15
    ).setScrollFactor(0).setDepth(999);

    this.time.delayedCall(80, () => { if (rect.active) rect.destroy(); });
  }

  // ──────────────────────────────── DAMAGE VIRUS ────────────────────────────
  projectileEnemyCollisionHandle(projectile,enemy,dmg,poison){
      this._damageVirus(enemy,dmg,poison)
  }
  _damageVirus(enemy, amount,poison) {
    console.log("virus has been hit")
    if (!enemy.active) return;
    console.log("enemy passed active check")
    // if (enemy.hitCooldown) return;
    console.log("enemy passed cooldown check")

    enemy.hitCooldown = true;
    enemy.hp -= amount;
    console.log("virus hp", enemy.hp);
    // Glitch flash
    this._triggerVirusGlitch(enemy);

    if (enemy.hp <= 0) {
      // Death burst: spawn a few disappearing spark rectangles
      for (let i = 0; i < 5; i++) {
        const spark = this.add.rectangle(
          enemy.x + Phaser.Math.Between(-8, 8),
          enemy.y + Phaser.Math.Between(-8, 8),
          3, 3, [0xff00ff,0x00ffff,0x00ff41,0xffff00][i % 4]
        ).setDepth(20);
        this.time.delayedCall(150 + i * 60, () => { if (spark.active) spark.destroy(); });
      }
      enemy.destroy();
      playerData.stats.enemyKills += 1;
      return;
    }
    if (poison){
      return;
    }
    // Knockback (white flash)
    enemy.setTintFill(0xffffff);
    enemy.isKnockedBack = true;
    const kbDir = (this.player.x < enemy.x) ? 1 : -1;
    enemy.setVelocity(kbDir * this.knockbackSpeedX, -this.knockbackSpeedY);

    this.time.delayedCall(400, () => {
      if (!enemy.active) return;
      enemy.clearTint();
      enemy.isKnockedBack = false;
      enemy.hitCooldown   = false;
    });
  }

  // ──────────────────────────────── SPIKES ──────────────────────────────────
  _handleSpikeOverlap(player, spike) {
    if (this.playerIsDead) return;
    if (spike && spike.index !== -1) {
      this.die();
    }
  }


  // ──────────────────────────────── GATEWAY ────────────────────────────────
  _enterGateway() {
    if (this.walkingSfx && this.walkingSfx.isPlaying) {
      this.walkingSfx.stop();
    }
    if (this._glitchTimer) this._glitchTimer.remove();

    this.time.delayedCall(400, () => {
      playerData.didBeatL2 = true;
      fadeToScene(this, "overworld");
    });
  }

}