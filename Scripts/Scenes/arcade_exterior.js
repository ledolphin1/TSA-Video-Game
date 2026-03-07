import * as Phaser from 'phaser';
import constructor_init from './Functions/constructor_init';
export default class arcade_exterior extends Phaser.Scene {
    constructor() {
        super({ key: 'arcade_exterior' });

        constructor_init.call(this);


    }

    preload() {
            this.physics.world.roundPixels = false;
    this.cameras.main.setRoundPixels(false);
        this.load.image("frame", "Assets/ARCADE_BORDER.png")
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
         this.load.video("begin", "Assets/Arcade_Exterior_begin.mp4", true)
         this.load.video("loop", "Assets/Arcade_Exterior_loop.mp4", true)
        this.load.audio('background', 'Assets/audio/background_music_filler.mp3');

        this.load.spritesheet('arrow', 'Assets/arrow.png', {
            frameWidth: 55,
            frameHeight: 16
        });

    }

    create() {
        
        this.physics.world.setBounds(0, 0, this.scale.width,this.scale.height - 36);
        // this.game.canvas.style.filter = "contrast(1) saturate(1.5) brightness(1.5)";
        const video = this.add.video(0, 0, 'begin');
        video.setOrigin(0,0)
        video.play(false);
        const loopvid = this.add.video(0,0,"loop")
        loopvid.setOrigin(0, 0)
        video.on('complete', () => {
            loopvid.play(true);
        });
        video.setTint(0xFFFFFF).setAlpha(1);
        console.log("arcade scene created");
        video.setDepth(-758743895789345)
        loopvid.setDepth(-758743895789345)

        video.preFX.addColorMatrix().brightness(1.5);
        video.preFX.addColorMatrix().saturate(1.5);

        loopvid.preFX.addColorMatrix().brightness(1.5);
        loopvid.preFX.addColorMatrix().saturate(1.5);

        
        
        //upload animations
        this.anims.create({
            key: "ow_player_moving",
            frames: this.anims.generateFrameNumbers("ow_player_running"),
            frameRate: 20,
            repeat: -1
        })
        this.anims.create({
            key: "arrow_anim",
            frames: this.anims.generateFrameNumbers("arrow"),
            frameRate: 15,
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
        
        
        const arrow = this.add.sprite(243,120,"arrow").setOrigin(0,0).play("arrow_anim",true);
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
        this.player.setCollideWorldBounds(true);
        this.cameras.main.setRoundPixels(false);
        // Force disable debug (just in case)
        this.physics.world.drawDebug = false;
        if (this.physics.world.debugGraphic) {
        this.physics.world.debugGraphic.setVisible(false);
        }

        
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
        // Post-Update Sync (Fixes Lag/Blur)
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
        if (this.player.x >= 223, this.player.x <= 245) {
            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        
                this.sound.stopAll();
                this.scene.start("overworld");
            }
    }
        
        
        
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


        // Update Coordinate Display
        this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);
    }
}
