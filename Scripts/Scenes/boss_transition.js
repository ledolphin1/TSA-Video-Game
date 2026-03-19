import * as Phaser from "phaser";
import constructor_init from "./Functions/constructor_init.js";
import preload_init from "./Functions/preload_init.js";
import create_init from "./Functions/create_init.js";
import { customEmitter } from "./events.js";
import { playerData } from "./playerdata.js";
import { fadeToScene } from "./Functions/sceneFade.js";
export default class boss_transition extends Phaser.Scene {
  constructor() {
    super({ key: "bt1" });

    constructor_init.call(this);

  }

  preload() {
    customEmitter.emit("boss_transition")
    preload_init.call(this);
    this.load.spritesheet('boss_transition', "public/assets/AI_Sprite_hover_to_fly.png", {
      frameWidth: 62,
      frameHeight: 61
    })
    this.load.image("bossbg", "public/assets/bossbg.png");
    this.load.image("boss_still", "public/assets/AI_Sprite_fstill.png");
    this.load.tilemapTiledJSON("boss_level", "public/assets/Map/boss.tmj");
    this.load.image("boss_still", "public/assets/AI_Sprite_fstill.png");
  }

  create() {
    this.scene.bringToTop("Narator");
    this.add.image(160, 220, "bossbg");
    const map = this.make.tilemap({ key: "boss_level" });
    create_init.call(this, map,1) 
    if (this.music && this.music.isPlaying) {
      this.music.stop();
    }
    
    // this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).on("down", () => {
    //   fadeToScene(this, "dragonBoss");
    //     playerData.transitionX= this.player.x;
    //     playerData.transitionY= this.player.y;
    // });
        this.anims.create({
            key: "boss_transform",
            frames: this.anims.generateFrameNumbers("boss_transition"),
            frameRate: 5,
            repeat: 0,
            hideOnComplete: false
        })
    
    this.cameras.main.setScroll(0, 200);
    //Create Enemy Group
    this.enemies = this.physics.add.group();

    this.spawnEnemy(152, 273.5);
    this._buildEnemyHpBar();

    this.physics.add.collider(this.enemies, this.ground);

    this.player.x = playerData.transitionX;
    this.player.y = playerData.transitionY;

    const transformDelayMs = 200;
    const targetHp = 20;
    const startHp = 1;
    const fadeToDragonMs = 350;
    const sceneDurationMs = ((targetHp - startHp) + 1) * transformDelayMs + fadeToDragonMs;

    this.scarySuspense = this.sound.add("scarysuspense", {
      loop: false,
      volume: 0.3,
      rate: 1
    });
    this.scarySuspense.play();

    const fadeDurationMs = Math.min(3000, sceneDurationMs);
    const fadeStartMs = Math.max(0, sceneDurationMs - fadeDurationMs);
    this.time.delayedCall(fadeStartMs, () => {
      if (!this.scarySuspense || !this.scarySuspense.isPlaying) return;
      this.tweens.add({
        targets: this.scarySuspense,
        volume: 0,
        duration: fadeDurationMs,
        onComplete: () => {
          if (this.scarySuspense && this.scarySuspense.isPlaying) {
            this.scarySuspense.stop();
          }
        }
      });
    });

    this.events.once("shutdown", () => {
      if (this.scarySuspense && this.scarySuspense.isPlaying) {
        this.scarySuspense.stop();
      }
      if (this.scarySuspense) {
        this.scarySuspense.destroy();
      }
    });

    console.log("timetimetime")
    this.enemy.body.setAllowGravity(false)
    this.enemy.body.setVelocityY(-80);
    this._transformEvent = this.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => {
        if (this.enemy.hp >= 20) {
          this._transformEvent.remove(false);
          playerData.transitionX = this.player.x
          playerData.transitionY = this.player.y
          fadeToScene(this, "dragonBoss");
          return;
        }
        this.enemy.hp += 1;
        this._updateEnemyHpBar(this.enemy.hp);
      }
    });
  }


  update(time, delta) {

    if (this.enemy.y < 240){
        console.log("stop it now")
        this.enemy.body.setVelocityY(0)
    }
    this.onGround = this.player.body.blocked.down;
    if (this.onGround) {
      this.isJumping = false;
      this.lastGroundedTime = time;
    }
    if (this.player.body.velocity.y > 0 && !this.isAttacking) {
      this.playerVisual.play("player_falling", true);
    }

    
    if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
      this.scene.pause();
      this.scene.launch("Pause", { returnScene: this.scene.key });
    }



    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      if (this.onGround) {
        this.playerVisual.play("player_moving", true);
      }
      this.player.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      if (this.onGround) {
        this.playerVisual.play("player_moving", true);
      }
      this.player.setVelocityX(150);
    } else {
      this.player.setVelocityX(0);
      if (this.onGround) {
        this.playerVisual.setTexture("player_still");
      }
    }

    this.updateWalkingSfx(this.onGround && (this.cursors.left.isDown || this.cursors.right.isDown));

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

    this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);
  }

 

  spawnEnemy(x, y) {
    this.enemy = this.enemies.create(x, y, "boss_transform");
    const scale = 1;
    this.physics.add.collider(this.enemy, this.ground);
    this.enemy.setScale(scale);
    
    this.enemy.hp = 1;
    this.enemy.canShoot = true;
    this.enemy.lastShotTime = 0;
    this.enemy.isKnockedBack = false;
    this.enemy.hitCooldown = false;
    this.enemy.play("boss_transform");
    this.enemy.flipX = true;

    const eWidth = 49;
    const eHeight = 61 - 14;
    const eOffsetX = (this.enemy.width - eWidth) / 2;
    const eOffsetY = (this.enemy.height - eHeight);

    this.enemy.body.setSize(eWidth, eHeight);
    this.enemy.body.setOffset(eOffsetX, eOffsetY);
    this.enemy.body.debugBodyColor = 0xff0000;

    this.enemy.setCollideWorldBounds(true);
  }




  _buildEnemyHpBar() {
    const bw = 120, bh = 8, bx = 100, by = 6;
    this.enemyHpBarBg   = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.enemyHpBarFill = this.add.graphics().setScrollFactor(0).setDepth(1000);
    // Draw initial full bar
    this.enemyHpBarBg.lineStyle(1, 0xff0000);
    this.enemyHpBarBg.strokeRect(bx, by, bw, bh);
    this.enemyHpBarFill.fillStyle(0xdd0000);
    this.enemyHpBarFill.fillRect(bx + 1, by + 1.5, bw - 2.5, bh - 2.5);
  }

  _updateEnemyHpBar(currentHp) {
    // const enemy = this.enemies.getFirstAlive();
    // const maxHp = enemy ? 20 : 20; // snake always starts at 20
    const pct   = Phaser.Math.Clamp(currentHp / 20, 0, 1);
    const bw = 120, bh = 8, bx = 100, by = 6;

    this.enemyHpBarBg.clear();
    this.enemyHpBarFill.clear();

    this.enemyHpBarBg.lineStyle(1, 0xff0000);
    this.enemyHpBarBg.strokeRect(bx, by, bw, bh);

    this.enemyHpBarFill.fillStyle(0xdd0000);
    this.enemyHpBarFill.fillRect(bx + 1, by + 1.5, (bw - 2.5) * pct, bh - 2.5);
  }




}