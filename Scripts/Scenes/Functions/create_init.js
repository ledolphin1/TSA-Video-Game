import drawHealthBarUnbound from './drawHealthBar.js';
import fireProjectileUnbound from './fireProjectile.js';
import handleEnemyOverlapUnbound from './handleEnemyOverlap.js';
import drawCooldown from './drawCooldown.js';
import * as playerFuncs from './playerFuncs.js'
import * as Phaser from "phaser";
import waveProj from './wave.js';
const {updatePlayerHitboxUnbound, flashPlayerUnbound, killPlayerUnbound} = playerFuncs;
const create_init = function(map,debug){

    //Import Functions
    this.waveProj = waveProj.bind(this)
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
    this.cameras.main.startFollow(this.player, false, 1, 1);//ALWAYS THIS SETTING
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

    //Coords for debug//!
    this.coordText = this.add.text(this.cameras.main.width - 10, this.cameras.main.height - 10, 'X: 0 Y: 0', {
      fontFamily: "./code_fonts/melodica.regular.otf",
      fontSize: "16px",
      fill: "#ffffff"
    });
    this.coordText.setOrigin(1, 1);
    this.coordText.setScrollFactor(0);
    this.coordText.setDepth(1000);
    
    //sidney asked for music//!
    this.music = this.sound.add('background', {
      loop: true,
      volume: 0.65
    });
    this.music.play();
    
    this.lastFiredTime = 0; // Initialize cooldown timer//!

    
    // --- Post-Update Sync (Fixes Lag/Blur) ---//!
    // Sync runs AFTER physics, ensuring visual matches actual body position for this frame
    this.events.on('postupdate', () => {
        if (this.playerVisual && this.player) {
        let vX = Math.round(this.player.x);
        let vY = Math.round(this.player.y);

        // Apply Visual Offsets when attacking
        if (this.playerVisual.texture.key === 'player_attack_sheet') {
            // Invert X offset if facing left
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
}
export default create_init;