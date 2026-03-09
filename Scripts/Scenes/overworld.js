import * as Phaser from 'phaser';
import { customEmitter } from './events';

export default class Overworld extends Phaser.Scene {
    constructor() {
        super({ key: 'overworld' });

        {
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
        }

        this.projectileCooldown = 3000;
        this.projectileOnCooldown = false;
        this.projectileCooldownStart = 0;


    }

    preload() {

        customEmitter.emit("OVERWORLD_BEGIN")


        /*this.load.spritesheet('hitAnim', '/assets/hit.png', { // not created yet
          frameWidth: 64,
          frameHeight: 64
        });
      */
        this.load.image("frame", "/assets/ARCADE_BORDER.png")
        this.load.image("overworldbg", "/assets/arcade_interior.png")
        this.load.image('ow_player_still', '/assets/playerIdle.png'); //player image
        this.load.image('ow_player_falling_static', '/assets/playerFall.png'); //player image
        this.load.spritesheet("ow_player_jumping", "/assets/playerJump.png", {
            frameWidth: 16,
            frameHeight: 16
        })
        this.load.spritesheet('ow_player_running', '/assets/playerRun.png', {
            frameWidth: 16,
            frameHeight: 16
        })
        this.load.audio('background', '/assets/audio/background_music_filler.mp3');
        this.load.tilemapTiledJSON('overworld_level', '/assets/Map/overworld.tmj');
        this.load.image('tiles', '/assets/Map/tileset.png');

        this.load.spritesheet('arcadeMachine', '/assets/arcadeMachine.png', {
            frameWidth: 32,
            frameHeight: 48
        });

    }

    create() {

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).on('down', () => {
        this.scene.start('MainScene');
        });

        this.add.image(160, 240, "overworldbg");
        console.log("overworld scene created");
        this.physics.world.roundPixels = false;
        //upload animations
        this.anims.create({
            key: "ow_player_moving",
            frames: this.anims.generateFrameNumbers("ow_player_running"),
            frameRate: 20,
            repeat: -1
        })
       
        this.anims.create({
            key: "ow_player_jump_start",
            frames: this.anims.generateFrameNumbers("ow_player_jumping", {
                start: 0,
                end: 1
            }),
            frameRate: 1,
            repeat: 0,
            hideOnComplete: false
        })
        
        this.anims.create({
            key: "ow_player_falling",
            frames: this.anims.generateFrameNumbers("ow_player_jumping", {
                start: 0,
                end: 1
            }),
            frameRate: 10,
            repeat: 0,
            hideOnComplete: false
        })

        // --- Arcade Machine Animation ---
        this.anims.create({
            key: "arcade_idle",
            frames: this.anims.generateFrameNumbers("arcadeMachine"),
            frameRate: 10,
            repeat: -1
        });

        const map = this.make.tilemap({
            key: "overworld_level"
        })
        const tileset = map.addTilesetImage("Tileset", "tiles")
        this.ground = map.createLayer("Tile Layer 1", tileset)
        this.ground.setVisible(false);
        this.ground.setCollisionByExclusion([-1]);




        // --- Create Player ---
        this.player = this.physics.add.sprite(60, 296, "ow_player_still");
        this.player.setVisible(false); // Hide physics body sprite

        // Create Visual Sprite (No Physics)
        this.playerVisual = this.add.sprite(60, 296, "ow_player_still");
        this.playerVisual.setDepth(10); // Ensure it renders on top

        // Auto-center hitbox
        const pWidth = this.playerHitbox.width;
        const pHeight = this.playerHitbox.height;
        const pOffsetX = (this.player.width - pWidth) / 2;
        const pOffsetY = (this.player.height - pHeight); // Align to bottom
        // If you want pure center: (this.player.height - pHeight) / 2

        this.player.body.setSize(pWidth, pHeight);
        this.player.body.setOffset(pOffsetX, pOffsetY);

        this.physics.add.collider(this.player, this.ground)
        // this.cameras.main.startFollow(this.player, true, 1, 1);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setScroll(0, 200);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.player.setCollideWorldBounds(true);
        this.cameras.main.setRoundPixels(false);
        // Force disable debug (just in case)
        this.physics.world.drawDebug = false;
        if (this.physics.world.debugGraphic) {
        this.physics.world.debugGraphic.setVisible(false);
        }
        // --- Create Enemy Group ---

        // Spawn multiple enemies


        // --- Arcade Machine ---
        // Place it somewhere on the ground. Player is at y=296.
        // x=200 is an arbitrary position to the right of start
        this.arcadeMachine = this.physics.add.sprite(200, 283, "arcadeMachine");
        this.arcadeMachine.play("arcade_idle");
        this.arcadeMachine.setImmovable(true);
        this.arcadeMachine.body.allowGravity = false; // Or let it fall to ground if needed
        this.physics.add.collider(this.arcadeMachine, this.ground);

        // Interaction Logic
        this.physics.add.overlap(this.player, this.arcadeMachine, () => {
            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                // Stop music before switching if needed
                this.sound.stopAll();
                this.scene.start("MainScene");
            }
        });







        // --- Controls ---
        this.cursors = this.input.keyboard.createCursorKeys();


        this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)

        //cords for debug
        this.coordText = this.add.text(this.cameras.main.width - 10, this.cameras.main.height - 10, 'X: 0 Y: 0', {
            fontFamily: "./code_fonts/melodica.regular.otf",
            fontSize: "16px",
            fill: "#ffffff"
        });
        this.coordText.setOrigin(1, 1);
        this.coordText.setScrollFactor(0);
        this.coordText.setDepth(1000);

        //sidney asked for music
        const music = this.sound.add('background', {
            loop: true,
            volume: 0.65
        });

        music.play();
        this.player.x = 60;
        this.player.y = 200;
        // --- Post-Update Sync (Fixes Lag/Blur) ---
        // Sync runs AFTER physics, ensuring visual matches actual body position for this frame
        this.events.on('postupdate', () => {
            if (this.player && this.playerVisual) {
                this.playerVisual.x = this.player.x;
                this.playerVisual.y = this.player.y;
                this.playerVisual.flipX = this.player.flipX;
            }
        });



    }





    update(time, delta) {



        //switched onGround to a property (just in case)
        this.onGround = this.player.body.blocked.down;
        if (this.onGround) {
            this.isJumping = false
            this.lastGroundedTime = time;
        }
        if (this.player.body.velocity.y > 0 && !this.isAttacking) {
            this.playerVisual.play("ow_player_falling", true)
        }



        if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
            this.scene.pause()
            this.scene.launch("Pause", { returnScene: this.scene.key });
        }




        // Left/Right Movement

        if (this.cursors.left.isDown) {
            this.player.flipX = true;
            if (this.onGround) {
                this.playerVisual.play("ow_player_moving", true)
            }
            this.player.setVelocityX(-150);



        } else if (this.cursors.right.isDown) {
            this.player.flipX = false;
            if (this.onGround) {
                this.playerVisual.play("ow_player_moving", true)
            }
            this.player.setVelocityX(150);

        } else {
            this.player.setVelocityX(0);
            if (this.onGround) {
                this.playerVisual.setTexture("ow_player_still")
            }
        }


        // Update Coordinate Display
        this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);
    }
}
