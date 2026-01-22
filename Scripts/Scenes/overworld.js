import Phaser from 'phaser';

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
        this.load.spritesheet('enemySprite', '/Assets/snake-mob.png', {
            frameWidth: 22,
            frameHeight: 11
        }); // enemy spritesheet

        this.load.spritesheet('player_attack_sheet', '/Assets/Main Character Attack.png', {
            frameWidth: 64,
            frameHeight: 64
        })



        /*this.load.spritesheet('hitAnim', '/Assets/hit.png', { // not created yet
          frameWidth: 64,
          frameHeight: 64
        });
      */
        this.load.image("frame", "Assets/ARCADE_BORDER.png")
        this.load.image("overworldbg", "Assets/arcade_interior.png")
        this.load.image('ow_player_still', 'Assets/playerIdle.png'); //player image
        this.load.image('ow_player_falling_static', 'Assets/playerFall.png'); //player image
        this.load.spritesheet("ow_player_jumping", "Assets/playerJump.png", {
            frameWidth: 16,
            frameHeight: 16
        })
        this.load.spritesheet('ow_player_running', 'Assets/playerRun.png', {
            frameWidth: 16,
            frameHeight: 16
        })
        this.load.audio('background', 'Assets/audio/background_music_filler.mp3');
        this.load.tilemapTiledJSON('overworld_level', 'Assets/Map/overworld.tmj');
        this.load.image('tiles', 'Assets/Map/tileset.png');

    }

    create() {


        this.add.image(160, 220, "overworldbg");
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
            key: "enemy_moving",
            frames: this.anims.generateFrameNumbers("enemySprite"),
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
            key: "player_attack",
            frames: this.anims.generateFrameNumbers("player_attack_sheet", {
                start: 15,
                end: 18
            }),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: false
        });
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

        const map = this.make.tilemap({
            key: "overworld_level"
        })
        const tileset = map.addTilesetImage("Tileset", "tiles")
        this.ground = map.createLayer("Tile Layer 1", tileset)
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
        // this.physics.world.drawDebug = false;
        // if (this.physics.world.debugGraphic) {
        //   this.physics.world.debugGraphic.setVisible(false);
        // }
        // --- Create Enemy Group ---

        // Spawn multiple enemies









        // --- Controls ---
        this.cursors = this.input.keyboard.createCursorKeys();


        this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
        // this.add.image(0,0,"frame").setOrigin(0,0).setScrollFactor(0).setDepth(1001)

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


        this.cooldownRadius = 8;
        this.cooldownX = this.cameras.main.width - 15;
        this.cooldownY = 15;

        this.cooldownGraphic = this.add.graphics();
        this.cooldownGraphic.setScrollFactor(0);
        this.cooldownGraphic.setDepth(1000);
        this.cooldownGraphic.setVisible(false);

        this.healthBarWidth = 100;
        this.healthBarHeight = 10;
        this.healthBarX = 20; // distance from left
        this.healthBarY = 20; // distance from top

        this.healthBarBg = this.add.graphics();
        this.healthBarFill = this.add.graphics();

        this.healthBarBg.setScrollFactor(0);
        this.healthBarFill.setScrollFactor(0);
        this.healthBarBg.setDepth(1000);
        this.healthBarFill.setDepth(1000);

        this.drawHealthBar();

    }

    drawHealthBar() {
        const healthPercent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);

        this.healthBarBg.clear();
        this.healthBarFill.clear();

        this.healthBarBg.lineStyle(2, 0xffffff);
        this.healthBarBg.strokeRect(
            this.healthBarX,
            this.healthBarY,
            this.healthBarWidth,
            this.healthBarHeight
        );

        this.healthBarFill.fillStyle(0x00ff00);
        this.healthBarFill.fillRect(
            this.healthBarX + 2,
            this.healthBarY + 2,
            (this.healthBarWidth - 4) * healthPercent,
            this.healthBarHeight - 4
        );
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

        // Jumping
        if (this.cursors.up.isDown && (this.onGround || (time - this.lastGroundedTime < 100))) {
            this.player.setVelocityY(-300);
            this.lastGroundedTime = 0;
            this.isJumping = true;
            this.playerVisual.play("ow_player_jump_start", true);
        }

        // Variable jump height: cut velocity when button is released
        if (Phaser.Input.Keyboard.JustUp(this.cursors.up) && this.player.body.velocity.y < 0) {
            this.player.setVelocityY(this.player.body.velocity.y * 0.5);
        }

        if (Phaser.Input.Keyboard.JustUp(this.interactKey)) {
            this.scene.start("MainScene");
        }

        // Update Coordinate Display
        this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);
    }
}

