import * as Phaser from 'phaser';
import { customEmitter } from './events.js';
import { playerData } from './playerdata.js';
import { setupSceneFade, fadeToScene } from './Functions/sceneFade.js';

export default class Overworld extends Phaser.Scene {
    constructor() {
        super({ key: 'overworld' });

        {
            //Health & State
            this.maxHealth = 5;
            this.health = this.maxHealth;


            //Hitboxes
            // Offsets are auto-calculated to center
            this.playerHitbox = {
                width: 20,
                height: 28
            };


        }

        this.projectileCooldown = 3000;
        this.projectileOnCooldown = false;
        this.projectileCooldownStart = 0;


    }

    preload() {

        customEmitter.emit("OVERWORLD_BEGIN")


        this.load.image("frame", "public/assets/ARCADE_BORDER.png")
        this.load.image("overworldbg", "public/assets/arcade_interior.png")
        this.load.image('ow_player_still', 'public/assets/playerIdle.png');  
        this.load.image('ow_player_falling_static', 'public/assets/playerFall.png');  
        this.load.spritesheet("ow_player_jumping", "public/assets/playerJump.png", {
            frameWidth: 16,
            frameHeight: 16
        })
        this.load.spritesheet("ow_player_running", "public/assets/playerRun.png", {
            frameWidth: 16,
            frameHeight: 16
        })
        this.load.audio('background', 'public/assets/audio/background_music_filler.mp3');
        this.load.tilemapTiledJSON('overworld_level', 'public/assets/Map/overworld.tmj');
        this.load.image('tiles', 'public/assets/Map/tileset.png');
        
        this.load.spritesheet('arcadeMachinePurpleActive', 'public/assets/arcadeActive_purple.png', {
            frameWidth: 32,
            frameHeight: 64
        });
        this.load.spritesheet('arcadeMachineGreenActive', 'public/assets/arcadeActive_green.png', {
            frameWidth: 32,
            frameHeight: 64
        });
        this.load.spritesheet('arcadeMachineRedActive', 'public/assets/arcadeActive_red.png', {
            frameWidth: 32,
            frameHeight: 64
        });
        this.load.image('arcadeMachineRedBlank', 'public/assets/arcadeBlank_red.png');  
        this.load.image('arcadeMachineGreenBlank', 'public/assets/arcadeBlank_green.png');  
        this.load.image('arcadeMachinePurpleBlank', 'public/assets/arcadeBlank_purple.png');  
        this.load.image('arcadeMachineRedBroken', 'public/assets/arcadeBroken_red.png');  
        this.load.image('arcadeMachineGreenBroken', 'public/assets/arcadeBroken_green.png');  
        this.load.image('arcadeMachinePurpleBroken', 'public/assets/arcadeBroken_purple.png');  
        this.load.image('arcadeMachineRedLocked', 'public/assets/arcadeLocked_red.png');  
        this.load.image('arcadeMachineGreenLocked', 'public/assets/arcadeLocked_green.png');  
        this.load.image('arcadeMachinePurpleLocked', 'public/assets/arcadeLocked_purple.png');  
        this.load.image('lock', 'public/assets/lock.png');  

    }

    create() {
        setupSceneFade(this, { pauseGameplay: true, duration: 350 });

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).on('down', () => {
        fadeToScene(this, 'MainScene');
        });

        this.add.image(160, 240, "overworldbg");
        console.log("overworld scene created");
        this.physics.world.roundPixels = false;
        
        function owAnims(){
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

        //Arcade Machine Animation
        this.anims.create({
            key: "arcade_active_purple",
            frames: this.anims.generateFrameNumbers("arcadeMachinePurpleActive"),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "arcade_active_red",
            frames: this.anims.generateFrameNumbers("arcadeMachineRedActive"),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "arcade_active_green",
            frames: this.anims.generateFrameNumbers("arcadeMachineGreenActive"),
            frameRate: 10,
            repeat: -1
        });
    }
    if (!playerData.didLoadOverworld){
        owAnims.call(this);
        playerData.didLoadOverworld = true;
    }
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
        this.playerVisual = this.add.sprite(60, 296, "ow_player_still").setScale(2);
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
      
        this.pMechImg = (!playerData.didBeatL1)? "arcadeMachinePurpleBlank" : "arcadeMachinePurpleBroken"
        this.arcadeMachinePurple = this.physics.add.sprite(170, 273, this.pMechImg);
        this.arcadeMachinePurple.setImmovable(true);
        this.arcadeMachinePurple.body.allowGravity = false; // Or let it fall to ground if needed
        this.physics.add.collider(this.arcadeMachinePurple, this.ground);

        // Interaction Logic
        this.physics.add.overlap(this.player, this.arcadeMachinePurple, () => {
            if (playerData.didBeatL1){
                return;
            }
            if (!this.arcadeMachinePurple.anims.isPlaying){
            this.arcadeMachinePurple.play("arcade_active_purple")
            }
            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                this.sound.stopAll();
                fadeToScene(this, "MainScene");
            }
        });
        
        if (!playerData.didBeatL1){
            this.gMechImg = "arcadeMachineGreenLocked";
        }else if (!playerData.didBeatL2){
            this.gMechImg = "arcadeMachineGreenBlank";
        } else {
            this.gMechImg = "arcadeMachineGreenBroken"
        }
        this.gUsable = (playerData.didBeatL1 && !playerData.didBeatL2);
        this.arcadeMachineGreen = this.physics.add.sprite(220, 273, this.gMechImg);
        this.arcadeMachineGreen.setImmovable(true);
        this.arcadeMachineGreen.body.allowGravity = false; // Or let it fall to ground if needed
        this.physics.add.collider(this.arcadeMachineGreen, this.ground);
        // Interaction Logic
        this.physics.add.overlap(this.player, this.arcadeMachineGreen, () => {
            if (!this.gUsable){
                return;
            }
            if (!this.arcadeMachineGreen.anims.isPlaying){
                this.arcadeMachineGreen.play("arcade_active_green")
            }
            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                if (playerData.didBeatL1){
                    this.sound.stopAll();
                    this.scene.start("LevelTwo");
                } 
            }
        });
        
        if (!playerData.didBeatL2){
            this.rMechImg = "arcadeMachineRedLocked";
        }else if (playerData.didBeatL2){
            this.rMechImg = "arcadeMachineRedBlank";
        } else {
            this.rMechImg = "arcadeMachineRedBroken"
        }
        this.rUsable = playerData.didBeatL2;
        this.arcadeMachineRed = this.physics.add.sprite(270, 273, this.rMechImg);
        this.arcadeMachineRed.setImmovable(true);
        this.arcadeMachineRed.body.allowGravity = false; // Or let it fall to ground if needed
        this.physics.add.collider(this.arcadeMachineRed, this.ground);

        // Interaction Logic
        this.physics.add.overlap(this.player, this.arcadeMachineRed, () => {
            if (!this.rUsable){
                return
            }
            if (!this.arcadeMachineRed.anims.isPlaying){
                this.arcadeMachineRed.play("arcade_active_red")
            }
            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                if (!this.rUsable){
                    return;
                }
                if (playerData.didBeatL2){
                    this.sound.stopAll();
                    this.scene.start("boss");
                }
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
        if (!this.physics.overlap(this.player, this.arcadeMachinePurple) && !playerData.didBeatL1) {
            this.arcadeMachinePurple.setTexture("arcadeMachinePurpleBlank");
        }
        if (!this.physics.overlap(this.player, this.arcadeMachineGreen) && this.gUsable) {
            this.arcadeMachineGreen.setTexture("arcadeMachineGreenBlank");
        }
        if (!this.physics.overlap(this.player, this.arcadeMachineRed) && this.rUsable) {
            this.arcadeMachineRed.setTexture("arcadeMachineRedBlank");
        }
        
        
        
        //switched onGround to a property (just in case)
        this.onGround = this.player.body.blocked.down;

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
