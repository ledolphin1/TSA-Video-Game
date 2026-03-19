import * as Phaser from "phaser";
import constructor_init from "./Functions/constructor_init.js";
import { playerData } from "./playerdata.js";
import { customEmitter } from "./events.js";
import { setupSceneFade, fadeToScene } from "./Functions/sceneFade.js";

export default class arcade_exterior_outro extends Phaser.Scene {
    constructor() {
        super({ key: "arcade_exterior_outro" });

        constructor_init.call(this);


    }

    preload() {
        this.load.bitmapFont("game_font", "public/assets/pixel_fonts/fonts/square_6x6.png", "public/assets/pixel_fonts/fonts/square_6x6.xml")
        customEmitter.emit("ARCADE_EXTERIOR_OUTRO");
        this.physics.world.roundPixels = true;
        this.cameras.main.setRoundPixels(true);
        this.load.image("frame", "public/assets/ARCADE_BORDER.png")
        this.load.image("ow_player_still", "public/assets/playerIdle.png"); //player image
        this.load.image("ow_player_falling_static", "public/assets/playerFall.png"); //player image
        this.load.spritesheet("ow_player_jumping", "public/assets/playerJump.png", {
            frameWidth: 16,
            frameHeight: 16
        })
        this.load.spritesheet("ow_player_running", "public/assets/playerRun.png", {
            frameWidth: 16,
            frameHeight: 16
        })
         this.load.video("begin", "public/assets/Arcade_Exterior_begin.mp4", true)
         this.load.video("loop", "public/assets/Arcade_Exterior_loop.mp4", true)
        this.load.audio("scary", "public/assets/audio/scary.mp3");
        this.load.audio("walking", "public/assets/audio/walking2.mp3");

        this.load.spritesheet("arrow", "public/assets/arrow.png", {
            frameWidth: 55,
            frameHeight: 16
        });

    }

    create() {
        setupSceneFade(this, { pauseGameplay: true, duration: 350 });
        playerData.currentScene = "arcade_exterior_outro";
        console.log(playerData);
        this.physics.world.setBounds(0, 0, this.scale.width,this.scale.height - 36);
        // this.game.canvas.style.filter = "contrast(1) saturate(1.5) brightness(1.5)";
        const video = this.add.video(0, 0, "begin");
        video.setOrigin(0,0)
        video.play(false);
        const loopvid = this.add.video(0,0,"loop")
        loopvid.setOrigin(0, 0)
        video.on("complete", () => {
            loopvid.play(true);
        });
        video.setTint(0xFFFFFF).setAlpha(1);
        console.log("arcade scene created");
        video.setDepth(-758743895789345)
        loopvid.setDepth(-758743895789345)

        video.preFX.addColorMatrix().brightness(1.5);
        video.preFX.addColorMatrix().saturate(1);

        loopvid.preFX.addColorMatrix().brightness(1.5);
        loopvid.preFX.addColorMatrix().saturate(1);
        
        
        //upload animations
        this.anims.create({
            key: "ow_player_moving",
            frames: this.anims.generateFrameNumbers("ow_player_running"),
            frameRate: 15,
            repeat: -1
        })
        this.anims.create({
            key: "arrow_anim",
            frames: this.anims.generateFrameNumbers("arrow"),
            frameRate: 15,
            repeat: -1
        })
        
        
        
        
        const arrow = this.add.sprite(28,130,"arrow").setOrigin(0,0).play("arrow_anim",true);
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
            this.cameras.main.setRoundPixels(true);
            
            this.dialogue = this.add.bitmapText(this.playerVisual.x, 100, "game_font", "\"Let me out of here!\"", 10).setOrigin(0.5, 0)
            this.dialogue2 = this.add.bitmapText(this.playerVisual.x, 110, "game_font", "\"RUN!\"", 10).setOrigin(0.5, 0)
            this.time.delayedCall(5000,function (){
                    this.dialogue.destroy();
                    this.dialogue2.destroy();
                }.bind(this))
            
            // --- Controls ---
            this.cursors = this.input.keyboard.createCursorKeys();
            
            
            this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
            this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
            
            //cords for debug
        this.coordText = this.add.text(this.cameras.main.width - 10, this.cameras.main.height - 10, "X: 0 Y: 0", {
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
        stopSharedIfPlaying(this.game.__sharedBackgroundMusic);
        stopSharedIfPlaying(this.game.__sharedLevelMusic);
        stopSharedIfPlaying(this.game.__sharedBossMusic);

        let music = this.game.__sharedScaryMusic;
        if (!music || music.key !== "scary" || music.manager !== this.sound) {
            music = this.sound.add("scary", {
                loop: true,
                volume: 0.3
            });
            this.game.__sharedScaryMusic = music;
        }
        music.loop = true;
        music.volume = 0.3;

        this.walkingSfx = this.sound.add("walking", {
            loop: true,
            rate: 1.5,
            volume: 0.5
        });
        
        if (!music.isPlaying) {
            music.play();
        }
        this.music = music;
        this.player.x = 60;
        this.player.y = 200;
        // Post-Update Sync (Fixes Lag/Blur)
        // Sync runs AFTER physics, ensuring visual matches actual body position for this frame
        this.events.on("postupdate", () => {
            if (this.player && this.playerVisual) {
                this.playerVisual.x = this.player.x;
                this.playerVisual.y = this.player.y;
                this.playerVisual.flipX = this.player.flipX;
            }
        });

        this.events.once("shutdown", () => {
            if (this.walkingSfx && this.walkingSfx.isPlaying) {
                this.walkingSfx.stop();
            }
            if (this.walkingSfx) {
                this.walkingSfx.destroy();
            }
        });
        
        
        
    }
    
    update(time, delta) {
        if (this.walkingSfx) {
            const isWalking = this.onGround && (this.cursors.left.isDown || this.cursors.right.isDown);
            if (isWalking) {
                if (!this.walkingSfx.isPlaying) {
                    this.walkingSfx.play();
                }
            } else if (this.walkingSfx.isPlaying) {
                this.walkingSfx.stop();
            }
        }
        if (this.player.x < 20){
            fadeToScene(this,"WinCredits")
        }
        this.dialogue.x = this.playerVisual.x;
        this.dialogue2.x = this.playerVisual.x;
        if (this.player.x >= 226 && this.player.x <= 245) {
            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        
                if (this.walkingSfx && this.walkingSfx.isPlaying) {
                    this.walkingSfx.stop();
                }
                fadeToScene(this, "overworld");
            }    
    }
        //switched onGround to a property (just in case)
        this.onGround = this.player.body.blocked.down;
        if (this.onGround) {
            this.isJumping = false
            this.lastGroundedTime = time;
        }
        if (this.player.body.velocity.y > 0) {
            this.playerVisual.play("ow_player_falling", true)
        }
        
        
        
        if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
            if (this.walkingSfx && this.walkingSfx.isPlaying) {
                this.walkingSfx.stop();
            }
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
            customEmitter.emit("MOVED")
            
            
            
        } else if (this.cursors.right.isDown) {
            this.player.flipX = false;
            if (this.onGround) {
                this.playerVisual.play("ow_player_moving", true)
            }
            this.player.setVelocityX(150);
            customEmitter.emit("MOVED")

        } else {
            this.player.setVelocityX(0);
            if (this.onGround) {
                this.playerVisual.setTexture("ow_player_still")
            }
        }

        // // Jumping
        // if (this.cursors.up.isDown && (this.onGround || (time - this.lastGroundedTime < 100))) {
        //     this.player.setVelocityY(-300);
        //     this.lastGroundedTime = 0;
        //     this.isJumping = true;
        //     this.playerVisual.play("ow_player_jump_start", true);
        // }

        // // Variable jump height: cut velocity when button is released
        // if (Phaser.Input.Keyboard.JustUp(this.cursors.up) && this.player.body.velocity.y < 0) {
        //     this.player.setVelocityY(this.player.body.velocity.y * 0.5);
        // }


        // Update Coordinate Display
        this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);
    }
}
