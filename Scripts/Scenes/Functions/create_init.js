import drawHealthBarUnbound from './drawHealthBar.js';
import fireProjectileUnbound from './fireProjectile.js';
import handleEnemyOverlapUnbound from './handleEnemyOverlap.js';
import drawCooldown from './drawCooldown.js';
import * as playerFuncs from './playerFuncs.js'
import * as Phaser from "phaser";
import waveProj from './wave.js';
import hyper from './hyper.js';
import poison from './poison.js';
import selectAbility from './selectAbility.js';
import { setupSceneFade } from './sceneFade.js';

const {updatePlayerHitboxUnbound, flashPlayerUnbound, killPlayerUnbound} = playerFuncs;
const create_init = function(map,debug){

    //Import Functions
    this.selectAbility = selectAbility.bind(this)
    this.waveProj = waveProj.bind(this)
    this.poison = poison.bind(this)
    this.hyper = hyper.bind(this);
    this.drawCooldown = drawCooldown.bind(this)
    this.drawHealthBar = drawHealthBarUnbound.bind(this);
    this.updatePlayerHitbox = updatePlayerHitboxUnbound.bind(this);
    this.flashPlayer = flashPlayerUnbound.bind(this);
    this.fireProjectile = fireProjectileUnbound.bind(this);
    this.handleEnemyOverlap = handleEnemyOverlapUnbound.bind(this);
    this.killPlayer = killPlayerUnbound.bind(this);
    
    //Health Bar//!
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.setScrollFactor(0);
    this.healthBarBg.setDepth(1000);
    this.healthBarFill = this.add.graphics();
    this.healthBarFill.setScrollFactor(0);
    this.healthBarFill.setDepth(1000);
    this.healthBarX = 20;
    this.healthBarY = 20;
    this.healthBarWidth = 100;
    this.healthBarHeight = 10;
    
    //Cooldown Bar//!
    this.cooldownRadius = 8;
    this.cooldownX = 30;
    this.cooldownY = 50;
    this.cooldownGraphic = this.add.graphics();
    this.cooldownGraphic.setScrollFactor(0);
    this.cooldownGraphic.setDepth(1000);
    this.cooldownGraphic.setVisible(false);
    
    //Draw Health Bar//!
    this.drawHealthBar();
    
    //Don('t) round pixels
    this.physics.world.roundPixels = true;
    this.cameras.main.setRoundPixels(true);
    
    
    // Create Player//!
    this.player = this.physics.add.sprite(270, 888, "player_still");
    this.player.setVisible(false); // Hide physics body sprite
    
    // Create Visual Sprite (No Physics)//!
    this.playerVisual = this.add.sprite(270, 888, "player_still");
    this.playerVisual.setDepth(10); // Ensure it renders on top
    
    // Auto-center hitbox//!
    const pWidth = this.playerHitbox.width;
    const pHeight = this.playerHitbox.height;
    const pOffsetX = (this.player.width - pWidth) / 2;
    const pOffsetY = (this.player.height - pHeight); // Align to bottom
    // If you want pure center: (this.player.height - pHeight) / 2
    
    this.player.body.setSize(pWidth, pHeight);//!
    this.player.body.setOffset(pOffsetX, pOffsetY);//!
    
    //Code is adaptive: code adapts to the given map //!
    const tileset = map.addTilesetImage("Tileset", "tiles")
    this.ground = map.createLayer("platforms", tileset)
    this.ground.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, this.ground)
    
    //Camera configurations (also adapts to the given map)//!
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player.setCollideWorldBounds(true);
  
    // player projectiles//!
    this.playerProjectiles = this.physics.add.group();

    //Controls//!
    this.cursors = this.input.keyboard.createCursorKeys()
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.skipKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.selectAbilityKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);


    //Coords for debug//!
    this.coordText = this.add.text(this.cameras.main.width - 10, this.cameras.main.height - 10, 'X: 0 Y: 0', {
      fontFamily: "./code_fonts/melodica.regular.otf",
      fontSize: "16px",
      fill: "#ffffff"
    });
    this.coordText.setOrigin(1, 1);
    this.coordText.setScrollFactor(0);
    this.coordText.setDepth(1000);

    const stopSharedIfPlaying = (musicRef) => {
      if (musicRef && musicRef.isPlaying) {
        musicRef.stop();
      }
    };
    
    //sidney asked for music//!
    if (this.scene.key !== "bt1") {
      let sharedMusicRefKey = "__sharedLevelMusic";
      let musicAssetKey = "levelsound";

      if (this.scene.key === "boss") {
        sharedMusicRefKey = "__sharedBossMusic";
        musicAssetKey = "bosssound";
      }

      const sharedMusicRefs = [
        "__sharedScaryMusic",
        "__sharedBackgroundMusic",
        "__sharedLevelMusic",
        "__sharedBossMusic"
      ];

      sharedMusicRefs.forEach((refKey) => {
        if (refKey !== sharedMusicRefKey) {
          stopSharedIfPlaying(this.game[refKey]);
        }
      });

      let sharedSceneMusic = this.game[sharedMusicRefKey];
      if (!sharedSceneMusic || sharedSceneMusic.key !== musicAssetKey || sharedSceneMusic.manager !== this.sound) {
        sharedSceneMusic = this.sound.add(musicAssetKey, {
          loop: true,
          volume: 0.3
        });
        this.game[sharedMusicRefKey] = sharedSceneMusic;
      }
      sharedSceneMusic.loop = true;
      sharedSceneMusic.volume = 0.3;
      if (!sharedSceneMusic.isPlaying) {
        sharedSceneMusic.play();
      }
      this.music = sharedSceneMusic;
    }

    this.walkingSfx = this.sound.add('walking', {
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
    
    this.lastFiredTime = 0; // Initialize cooldown timer//!

    
    this.events.on('postupdate', () => {
        if (this.playerVisual && this.player) {
      let vX = this.player.x;
      let vY = this.player.y;

        if (this.playerVisual.texture.key === 'player_attack_sheet') {
            if (this.player.flipX) {
            vX -= this.attackVisualOffset.x;
            } else {
            vX += this.attackVisualOffset.x;
            }
            vY += this.attackVisualOffset.y;
        }

        this.playerVisual.setPosition(vX, vY);
        this.playerVisual.setFlipX(this.player.flipX);


        }
    });

    if (this.scene && this.scene.key !== "boss" && this.scene.key !== "bt1" && this.scene.key !== "dragonBoss") {
      setupSceneFade(this, { pauseGameplay: true, duration: 350 });
    }

    this.events.once('shutdown', () => {
      if (this.walkingSfx && this.walkingSfx.isPlaying) {
        this.walkingSfx.stop();
      }
      if (this.walkingSfx) {
        this.walkingSfx.destroy();
      }
    });
}
export default create_init;