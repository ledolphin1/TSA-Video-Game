import * as Phaser from "phaser";
import preload_init from "./Functions/preload_init.js";
import { customEmitter } from "./events.js";
import { playerData } from "./playerdata.js";
import waveProj from "./Functions/wave.js";
import hyper from "./Functions/hyper.js";
import poison from "./Functions/poison.js";
import selectAbility from "./Functions/selectAbility.js";
import { fadeToScene, setupSceneFade } from "./Functions/sceneFade.js";

export default class DragonBossScene extends Phaser.Scene {
  constructor() {
    super({ key: "dragonBoss" });
    this.waveProj = waveProj.bind(this);
    this.hyper = hyper.bind(this);
    this.poison = poison.bind(this);
    // Health & State — player has TWICE as much health as in boss/mainscene
    this.maxHealth = 10;
    this.health = this.maxHealth;

    this.isInvincible = false;
    this.playerIsDead = false;
    this.isAttacking = false;
    this.isKnockedBack = false;

    // Combat
    this.slashDamage = 1;
    this.projectileDamage = 1;   // fire breath does 1 damage per hit

    this.knockbackSpeedX = 100;
    this.knockbackSpeedY = 67;

    this.lastAttackEndTime = 0;

    // Hitboxes
    this.playerHitbox = { width: 10, height: 14 };

    // Dragon hitbox — intentionally slightly *smaller* than the visible sprite
    // so melee can connect at the edges without triggering contact damage
    this.dragonHitbox = { width: 55, height: 32 };

    // Visual offset for attack sprite (same as other scenes)
    this.attackVisualOffset = { x: 9, y: -8 };

    // Dragon state
    this.dragonMaxHp = 40;
    this.dragonHp = this.dragonMaxHp;
    this.dragonDefeated = false;
    this._dragonLastHitTime = 0;
    this._dragonHitLock = false;

    // Projectile cooldown
    this.projectileCooldown = 3000;
    this.projectileOnCooldown = false;
    this.projectileCooldownStart = 999999;
  }

  preload() {
    customEmitter.emit("DRAGONBOSS")
    // Player assets (reuse same keys as other scenes — guard against double-load)
    preload_init.call(this); // Use default preload loader
    // Dragon sprite — 32×24 per frame, 4 frames wide
    this.load.spritesheet("dragon", "public/assets/dragon.png", {
      frameWidth: 32, frameHeight: 24
    });
    this.load.image("ai_fly","public/assets/AI_Sprite_fly.png")
    // Fire breath particle — 8×8 per frame, 3 frames
    this.load.spritesheet("dragonFire", "public/assets/dragonFire.png", {
      frameWidth: 8, frameHeight: 8
    });

    // Tilemap (reuse boss room layout)
    this.load.tilemapTiledJSON("boss_level", "public/assets/Map/boss.tmj");

    // Background & UI
    this.load.image("bossbg", "public/assets/bossbg.png");
  }

  create() {
    this.scene.bringToTop("Narator");
    setupSceneFade(this, { pauseGameplay: false, duration: 350 });
    // ── Background ──────────────────────────────────────────
    this.add.image(160, 247, "bossbg");
    
    // this.physics.world.drawDebug = false;
    // if (this.physics.world.debugGraphic) {
    //   this.physics.world.debugGraphic.setVisible(false);
    // }

    // ── Tilemap ─────────────────────────────────────────────
    const map = this.make.tilemap({ key: "boss_level" });
    const tileset = map.addTilesetImage("Tileset", "tiles");
    this.ground = map.createLayer("platforms", tileset);
    this.ground.setCollisionByExclusion([-1]);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setScroll(0, 200);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);


    // Dragon flying animation (4 frames = wing flap cycle)
    this.anims.create({
      key: "dragon_fly",
      frames: this.anims.generateFrameNumbers("dragon", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    // Fire breath particle animation
    this.anims.create({
      key: "dragonFire_anim",
      frames: this.anims.generateFrameNumbers("dragonFire", { start: 0, end: 2 }),
      frameRate: 12,
      repeat: -1
    });

    // ── Player ───────────────────────────────────────────────
    this.player = this.physics.add.sprite(playerData.transitionX, playerData.transitionY, "player_still");
    this.player.setVisible(false);

    this.playerVisual = this.add.sprite(60, 280, "player_still");
    this.playerVisual.setDepth(10);

    const pW = this.playerHitbox.width;
    const pH = this.playerHitbox.height;
    this.player.body.setSize(pW, pH);
    this.player.body.setOffset((this.player.width - pW) / 2, this.player.height - pH);

    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.ground);

    // ── Dragon (physics sprite, flying) ──────────────────────
    this.dragon = this.physics.add.sprite(162, 210, "ai_fly");
    this.dragon.setScale(1);          // 3× scale → 96×72 px on screen
    this.dragon.play("ai_fly");
    this.dragon.body.allowGravity = false;
    // Do NOT use setCollideWorldBounds — we handle turnaround manually

    // Tighter hitbox centered in the dragon"s body
    const dW = this.dragonHitbox.width;
    const dH = this.dragonHitbox.height;
    this.dragon.body.setSize(dW, dH);
    this.dragon.body.setOffset(
      (this.dragon.width - dW) / 2,
      (this.dragon.height - dH) / 2 + 2
    );
    // Dragon movement bookkeeping
    this.dragon.moveDir = -1;          // -1 = left, 1 = right
    this.dragon.lastFireTime = 0;
    this.dragon.fireCooldown = 1900;   // ms between breath bursts
    this.dragon.burstCount = 0;
    
    // Dragon health bar (drawn above the dragon)
    this._buildDragonHpBar();
    
    // ── Fire Breath Group ────────────────────────────────────
    this.fireBalls = this.physics.add.group();
    
    // Fire hits ground → destroy
    this.physics.add.collider(this.fireBalls, this.ground, (fb) => {
      if (fb.active) fb.destroy();
    });
    
    // Fire hits player → damage (one hit per fireball)
    this.physics.add.overlap(this.player, this.fireBalls, (player, fb) => {
      if (this._isSceneTransitioning) return;
      if (!fb.active || fb._hit) return;
      fb._hit = true;
      fb.destroy();
      this._handleDragonHit();
    });
    
    // ── Player Projectiles ───────────────────────────────────
    this.playerProjectiles = this.physics.add.group();
  
  
    // NOTE: per-shot overlap is registered inside _fireProjectile, exactly like boss.js
    
    // Player touching dragon body → damage with cooldown (prevents per-frame drain)
    this._dragonContactCooldown = false;
    this.physics.add.overlap(this.player, this.dragon, () => {
      if (this._isSceneTransitioning) return;
      if (this._dragonContactCooldown) return;
      this._dragonContactCooldown = true;
      setTimeout(() => { this._dragonContactCooldown = false; }, 600);
      this._handleDragonHit();
    });
    this.physics.add.overlap(this.playerProjectiles, this.fireBalls, (pproj, proj) => {
      if (proj && proj.active) {
        console.log("destroy enemy projs")
        proj.destroy();
      }
    });
    // ── Controls ─────────────────────────────────────────────
    this.cursors   = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fireKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.menuKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.abilityTwoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    this.lastFiredTime = 0;
    
    // ── HUD: Player Health Bar ───────────────────────────────
    this.healthBarBg   = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.healthBarFill = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.healthBarX = 20; this.healthBarY = 20;
    this.healthBarWidth = 100; this.healthBarHeight = 10;
    this._drawPlayerHpBar();
    
    // Projectile cooldown indicator (top-right arc)
    this.cooldownRadius = 8;
    this.cooldownX = 30;
    this.cooldownY  = 50;
    this.cooldownGraphic = this.add.graphics().setScrollFactor(0).setDepth(1000).setVisible(false);

    this.cooldown2Y = 70;
    this.cooldown2Graphic = this.add.graphics().setScrollFactor(0).setDepth(1000).setVisible(false);

    this.secondaryOnCooldown = false;
    this.secondaryCooldownStart = 0;
    this.lastSecondaryFiredTime = 0;
    
    // ── Post-update visual sync ──────────────────────────────
    this.events.on("postupdate", () => {
      if (!this.player || !this.playerVisual) return;
      let vX = this.player.x;
      let vY = this.player.y;
      if (this.playerVisual.texture.key === "player_attack_sheet") {
        vX += this.player.flipX ? -this.attackVisualOffset.x : this.attackVisualOffset.x;
        vY += this.attackVisualOffset.y;
      }
      this.playerVisual.setPosition(vX, vY);
      this.playerVisual.setFlipX(this.player.flipX);
    });
    this.events.once("shutdown", () => {
      if (this.walkingSfx && this.walkingSfx.isPlaying) {
        this.walkingSfx.stop();
      }
      if (this.walkingSfx) {
        this.walkingSfx.destroy();
      }
    });
    
    // ── Music ────────────────────────────────────────────────
    const stopSharedIfPlaying = (musicRef) => {
      if (musicRef && musicRef.isPlaying) {
        musicRef.stop();
      }
    };
    stopSharedIfPlaying(this.game.__sharedScaryMusic);
    stopSharedIfPlaying(this.game.__sharedBackgroundMusic);
    stopSharedIfPlaying(this.game.__sharedLevelMusic);

    let sharedBossMusic = this.game.__sharedBossMusic;
    if (!sharedBossMusic || sharedBossMusic.key !== "bosssound" || sharedBossMusic.manager !== this.sound) {
      sharedBossMusic = this.sound.add("bosssound", { loop: true, volume: 0.3 });
      this.game.__sharedBossMusic = sharedBossMusic;
    }
    sharedBossMusic.loop = true;
    sharedBossMusic.volume = 0.3;
    if (!sharedBossMusic.isPlaying) {
      sharedBossMusic.play();
    }
    this.music = sharedBossMusic;
    this.walkingSfx = this.sound.add("walking", {
      loop: true,
      rate: 1.5,
      volume: 0.5
    });
    this.updateWalkingSfx = function(isWalking) {
      if (!this.walkingSfx) return;
      if (isWalking) {
        if (!this.walkingSfx.isPlaying) {
          this.walkingSfx.play();
        }
      } else if (this.walkingSfx.isPlaying) {
        this.walkingSfx.stop();
      }
    };
    
    // ── Victory / defeat text (hidden until triggered) ───────
    this.outcomeText = this.add.text(
      this.cameras.main.width / 2, this.cameras.main.height / 2,
      "", { fontSize: "16px", color: "#ffffff", backgroundColor: "#000000",
        padding: { x: 6, y: 4 } }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(2000).setVisible(false);
      this.dragon.flipX = false;
    }
    
    // ============================================================
    //  UPDATE
    // ============================================================
  update(time, delta) {
    if (this._isSceneTransitioning) {
      this.updateWalkingSfx(false);
      return;
    }
    if (this.dragonDefeated) {
      this.updateWalkingSfx(false);
      return;
    }
    if (this.playerIsDead) {
      this.updateWalkingSfx(false);
      return;
    }
    if (this.isKnockedBack) {
      this.updateWalkingSfx(false);
      return;
    }

    // Cooldown arcs
    if (this.projectileOnCooldown) {
      const elapsed  = time - this.projectileCooldownStart;
      const progress = Phaser.Math.Clamp(elapsed / this.projectileCooldown, 0, 1);
      this._drawCooldown(progress, 1);
      if (progress >= 1) this.projectileOnCooldown = false;
    }
    if (this.secondaryOnCooldown) {
      const elapsed  = time - this.secondaryCooldownStart;
      const progress = Phaser.Math.Clamp(elapsed / this.projectileCooldown, 0, 1);
      this._drawCooldown(progress, 2);
      if (progress >= 1) this.secondaryOnCooldown = false;
    }

    // ── Dragon AI ───────────────────────────────────────────
    this._updateDragon(time);

    // ── Player grounded check ───────────────────────────────
    this.onGround = this.player.body.blocked.down;
    if (this.onGround) {
      this.isJumping = false;
      this.lastGroundedTime = time;
    }

    if (this.player.body.velocity.y > 0 && !this.isAttacking) {
      this.playerVisual.play("player_falling", true);
    }

    // ── Attack inputs ────────────────────────────────────────
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking &&
        time > this.lastAttackEndTime + 10) {
      this._performAttack();
    }

    const primaryWep = playerData.weapons.length > 1 ? playerData.weapons[1] : playerData.weapons[0];
    const secondaryWep = playerData.weapons.length > 2 ? playerData.weapons[2] : null;

    if (Phaser.Input.Keyboard.JustDown(this.abilityTwoKey) && !this.secondaryOnCooldown) {
      if (secondaryWep) {
        selectAbility.call(this, time, secondaryWep, 2);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.fireKey) && !this.projectileOnCooldown) {
      selectAbility.call(this, time, primaryWep, 1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
      this.scene.pause();
      this.scene.launch("Pause", { returnScene: this.scene.key });
    }
    if (this.isAttacking) {
      this.updateWalkingSfx(false);
      return;
    }

    // ── Movement ─────────────────────────────────────────────
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

    // ── Jump ─────────────────────────────────────────────────
    if (this.cursors.up.isDown &&
        (this.onGround || (time - this.lastGroundedTime < 100))) {
      this.sound.play("jump", { volume: 0.125, seek: 0.425 });
      this.player.setVelocityY(-300);
      this.lastGroundedTime = 0;
      this.isJumping = true;
      this.playerVisual.play("player_jump_start", true);
    }
    if (Phaser.Input.Keyboard.JustUp(this.cursors.up) && this.player.body.velocity.y < 0) {
      this.player.setVelocityY(this.player.body.velocity.y * 0.5);
    }
  }

  // ============================================================
  //  DRAGON AI
  // ============================================================
  _updateDragon(time) {
    if (!this.dragon || !this.dragon.active) return;

    const spd       = 55;
    const mapW      = 320;
    const leftEdge  = 40;
    const rightEdge = mapW - 40;

    // Turn around before hitting the walls
    if (this.dragon.x <= leftEdge) {
      this.dragon.moveDir = 1;
      this.dragon.x = leftEdge;          // prevent creeping past edge
    } else if (this.dragon.x >= rightEdge) {
      this.dragon.moveDir = -1;
      this.dragon.x = rightEdge;         // prevent creeping past edge
    }

    // Horizontal only — hard-lock Y every frame so it never drifts
    this.dragon.body.setVelocityX(this.dragon.moveDir * spd);
    this.dragon.body.setVelocityY(0);
    this.dragon.y = 210;

    // Face the player
    this.dragon.flipX = (this.player.x < this.dragon.x);

    // ── Fire breath ──────────────────────────────────────────
    if (time - this.dragon.lastFireTime > this.dragon.fireCooldown) {
      this.dragon.lastFireTime = time;
      this._breathFire();
    }

    // Keep dragon HP bar above dragon
    this._updateDragonHpBarPos();
  }

  // ============================================================
  //  FIRE BREATH — burst of 4 fireballs in a spread
  // ============================================================
  _breathFire() {
    if (!this.dragon || !this.dragon.active) return;

    const numShots   = 6;
    const spreadStep = 200; // ms between each ball in a burst

    for (let i = 0; i < numShots; i++) {
      this.time.delayedCall(i * spreadStep, () => {
        if (!this.dragon || !this.dragon.active) return;

        // Spawn from the dragon"s mouth (front edge)
        const mouthOffX = this.dragon.flipX ? -28 : 28;
        const mouthX    = this.dragon.x + mouthOffX;
        const mouthY    = this.dragon.y + 4;

        const fb = this.add.sprite(mouthX, mouthY, "dragonFire");
        fb.play("dragonFire_anim");
        fb.setDepth(9);
        this.physics.add.existing(fb);
        this.fireBalls.add(fb);

        fb.body.allowGravity = false;
        fb.body.setSize(6, 6);

        // Aim at player with slight vertical spread
        const angle = Phaser.Math.Angle.Between(mouthX, mouthY, this.player.x, this.player.y);
        const spread = (i - (numShots - 1) / 2) * 0.12; // radians spread
        const speed  = 110;
        fb.body.setVelocity(
          Math.cos(angle + spread) * speed,
          Math.sin(angle + spread) * speed
        );

        // Auto-destroy after 3 seconds
        this.time.delayedCall(3000, () => {
          if (fb && fb.active) fb.destroy();
        });
      });
    }
  }

  // ============================================================
  //  DAMAGE DRAGON (melee or projectile)
  // ============================================================
  _damageDragon(amount,poison) {
    console.log("ouch")
    if (!this.dragon || !this.dragon.active) return;
    if (this.dragonDefeated) return;
    // if (this._dragonHitLock) return;

    // this._dragonHitLock = true;
    // setTimeout(() => { this._dragonHitLock = false; }, 300);

    this.dragonHp = Math.max(0, this.dragonHp - amount);
    this._updateDragonHpBar();
if (!poison){
  this.dragon.setTintFill(0xffffff);
  this.time.delayedCall(120,() => {
    if (this.dragon && this.dragon.active) this.dragon.clearTint();
  });
}

    if (this.dragonHp <= 0) {
      this._defeatDragon();
      return;
    }

    if (!poison) {
      this.physics.world.pause();
      this.anims.pauseAll();
      this.time.delayedCall(80,() => {
        if (!this.dragonDefeated) {
          this.physics.world.resume();
          this.anims.resumeAll();
        }
      });
    }
  }

  // ============================================================
  //  DEFEAT DRAGON
  // ============================================================
  _defeatDragon() {
    if (this.dragonDefeated) return;
    this.dragonDefeated = true;
    playerData.stats.enemyKills += 1;
    playerData.stats.bossesDefeated += 1;

    customEmitter.emit("DRAGONBOSS_CLEAR");
    this.sound.stopAll()
    this.dragon.setTint(0xff4400);
    this.physics.world.pause();
    this.anims.pauseAll();


    setTimeout(() => {
      if (this.dragon && this.dragon.active) this.dragon.destroy();
      try { this.music.stop(); } catch (e) {}

      this.physics.world.resume();
      this.anims.resumeAll();

      this.time.delayedCall(1100, () => {
        fadeToScene(this, "WinCredits", undefined, 450);
      });
    }, 800);
  }


  _handleDragonHit() {
    if (this._isSceneTransitioning) return;
    if (this.playerIsDead || this.isInvincible) return;

    this.health--;
    playerData.stats.damageTaken += 1;
    this._drawPlayerHpBar();
    this.isInvincible = true;

    if (this.health <= 0) {
      this._killPlayer();
      return;
    }

    this.isKnockedBack = true;
    const dir = (this.player.x < this.dragon.x) ? -1 : 1;
    this.player.setVelocity(dir * 110, -60);

    this.time.delayedCall(250,() => { this.isKnockedBack = false; });
    this._flashPlayer();
  }

  _performAttack() {
    playerData.stats.meleeAttacks += 1;
    this.sound.play("swordslash", { volume: 0.135 });
    this.isJumping    = false;
    this.isAttacking  = true;
    this.player.setVelocity(0, 0);
    this.player.body.allowGravity = false;

    this.time.delayedCall(1, () => { this._updatePlayerHitbox(); });

    const offsetX    = this.player.flipX ? -20 : 20;
    const attackHitbox = this.physics.add.sprite(
      this.player.x + offsetX, this.player.y, null
    );
    attackHitbox.body.setSize(30, 25);
    attackHitbox.setVisible(false);
    attackHitbox.body.allowGravity = false;

    this.playerVisual.play("player_attack", true);


    this.physics.add.overlap(attackHitbox, this.dragon, (hb, dragon) => {
      if (this.dragon._hitCooldown) return;
      this.dragon._hitCooldown = true;
      this.time.delayedCall(300,() => { if (this.dragon) this.dragon._hitCooldown = false; });
      this._damageDragon(this.slashDamage);
    });

    this.physics.add.overlap(attackHitbox, this.fireBalls, (hb, fb) => {
      if (fb && fb.active) fb.destroy();
    });

    setTimeout(() => { if (attackHitbox.active) attackHitbox.destroy(); }, 100);
    setTimeout(() => {
      this.isAttacking   = false;
      this.lastAttackEndTime = this.time.now;
      this.player.body.allowGravity = true;
      this._updatePlayerHitbox();
    }, 250);
  }

  _updatePlayerHitbox() {
    if (!this.player || !this.player.body) return;
    const pW = this.playerHitbox.width;
    const pH = this.playerHitbox.height;
    this.player.body.setSize(pW, pH);
    this.player.body.setOffset(
      (this.player.width  - pW) / 2,
      ((this.player.height - pH) / 2) + 1
    );
  }

  projectileEnemyCollisionHandle(projectile,enemy,dmg,poison){
    this._damageDragon(dmg,poison);
  }
  fireProjectile(time, slot = 1) {
    this.sound.play("projectilesound", { seek: 0.2 });
    if (slot === 1) {
      this.projectileOnCooldown    = true;
      this.projectileCooldownStart = time;
      this.lastFiredTime           = time;
    } else {
      this.secondaryOnCooldown    = true;
      this.secondaryCooldownStart = time;
      this.lastSecondaryFiredTime = time;
    }
    playerData.stats.projectilesFired += 1;

    const proj = this.physics.add.sprite(this.player.x, this.player.y, "lpProjectile");
    proj.flipX = this.player.flipX ? true : false;
    this.physics.add.existing(proj);
    this.playerProjectiles.add(proj);

    proj.body.allowGravity = false;
    proj.body.setVelocityX(this.player.flipX ? -400 : 400);

    this.time.delayedCall(2000, () => {
      if (proj.active) proj.destroy();
    });


    this.physics.add.overlap(proj, this.dragon, (projectile, dragon) => {
      if (!this.scene.isActive()) return;
      if (!dragon || !dragon.active) return;
      projectile.destroy();
      this._damageDragon(this.projectileDamage);
    });

    this.physics.add.collider(proj, this.ground, () => {
      proj.destroy();
    });
  }

  _killPlayer() {
    if (this.playerIsDead) return;
    this.playerIsDead = true;
    playerData.stats.deaths += 1;
    this.isJumping    = false;

    this.player.setVelocity(0, 0);
    this.player.body.enable = false;
    this.playerVisual.setTint(0xff0000);

    setTimeout(() => { this._respawnPlayer(); }, 800);
  }

  _respawnPlayer() {
    this.health        = this.maxHealth;
    this.playerIsDead  = false;
    this.isInvincible  = false;
    this.isAttacking   = false;

    this.playerVisual.clearTint();
    this.playerVisual.setTexture("player_still");
    this.playerVisual.setAlpha(1);
    this.player.enableBody(true, 60, 280, true, false);
    this.player.setVelocity(0, 0);
    this._drawPlayerHpBar();
  }

  _flashPlayer() {
    this.tweens.add({
      targets:  this.playerVisual,
      alpha:    0.5,
      duration: 100,
      yoyo:     true,
      repeat:   5,
      onComplete: () => {
        this.playerVisual.alpha = 1;
        this.isInvincible = false;
      }
    });
  }


  _drawPlayerHpBar() {
    const pct = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
    this.healthBarBg.clear();
    this.healthBarFill.clear();

    this.healthBarBg.lineStyle(2, 0xffffff);
    this.healthBarBg.strokeRect(this.healthBarX, this.healthBarY,
      this.healthBarWidth, this.healthBarHeight);

    this.healthBarFill.fillStyle(0x00ff00);
    this.healthBarFill.fillRect(
      this.healthBarX + 2, this.healthBarY + 2,
      (this.healthBarWidth - 4) * pct, this.healthBarHeight - 4
    );
  }

  _buildDragonHpBar() {
    // Fixed position at top-center
    this.dragonHpBarBg   = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.dragonHpBarFill = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this._updateDragonHpBar();
  }

  _updateDragonHpBar() {
    const pct = Phaser.Math.Clamp(this.dragonHp / this.dragonMaxHp, 0, 1);
    const bw  = 120;
    const bh  = 8;
    const bx  = 100;
    const by  = 6;

    this.dragonHpBarBg.clear();
    this.dragonHpBarFill.clear();

    this.dragonHpBarBg.lineStyle(1, 0xff4400);
    this.dragonHpBarBg.strokeRect(bx, by, bw, bh);

    this.dragonHpBarFill.fillStyle(0xff2200);
    this.dragonHpBarFill.fillRect(bx + 1, by + 1.5, (bw - 2.5) * pct, bh - 2.5);
  }

  _updateDragonHpBarPos() {
  }

  _drawCooldown(progress, slot = 1) {
    let g = slot === 1 ? this.cooldownGraphic : this.cooldown2Graphic;
    let y = slot === 1 ? this.cooldownY : this.cooldown2Y;
    g.clear();
    if (progress >= 1) { g.setVisible(false); return; }
    g.setVisible(true);
    g.fillStyle(0x00ffff, 1);
    g.beginPath();
    g.moveTo(this.cooldownX, y);
    g.arc(
      this.cooldownX, y, this.cooldownRadius,
      Phaser.Math.DegToRad(-90),
      Phaser.Math.DegToRad(-90 + 360 * (1 - progress)),
      false
    );
    g.closePath();
    g.fillPath();
  }
  respawnPlayer() {
    this.health = this.maxHealth;
    this.drawHealthBar();
    this.playerIsDead = false;
    this.isInvincible = false;
    // Reset Player Position and Physics
    this.playerVisual.clearTint();
    this.playerVisual.setTexture("player_still"); // Reset animation
    this.player.enableBody(true, 270, 888, true, false); 
    this.playerVisual.setAlpha(1);
    this.player.setVelocity(0, 0);
    this.lastFiredTime = 0;
    this.isAttacking = false;
  }
}