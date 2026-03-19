import * as Phaser from "phaser";
const preload_init = function (){
    this.load.spritesheet('enemySprite', "public/assets/snakeMob.png", {
      frameWidth: 22,
      frameHeight: 11
    }); // enemy spritesheet
    
    this.load.spritesheet('player_attack_sheet', "public/assets/mainCharacterAttack.png", {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.image("frame", "public/assets/ARCADE_BORDER.png")
   this.load.image('player_still', "public/assets/Main Character Standing SSl.png"); //player image
   this.load.spritesheet("player_jumping", "public/assets/Main Character Jump SS.png", {
     frameWidth: 16,
     frameHeight: 16
    })
    this.load.spritesheet('player_running', "public/assets/Main Character Running SS.png", {
      frameWidth: 16,
      frameHeight: 16
    })
    this.load.audio('background', "public/assets/audio/epicbackground.mp3");
    this.load.audio('scary', "public/assets/audio/scary.mp3");
    this.load.audio('scarysuspense', "public/assets/audio/scarysuspense.mp3");
    this.load.audio('swordslash', "public/assets/audio/swordslash.mp3");
    this.load.audio('walking', "public/assets/audio/walking2.mp3");
    this.load.audio('jump', "public/assets/audio/jump.mp3");
    this.load.audio('projectilesound', "public/assets/audio/projectilesound.mp3");
    this.load.image('tiles', "public/assets/Map/tileset.png");
    this.load.image('lpProjectile',"public/assets/projectile.png")
    this.load.image('wave',"public/assets/wave.png")
    this.load.image('hyper',"public/assets/high-power-proj.png")
    this.load.image('poison',"public/assets/poison_proj.png")
    this.load.image('main_bg',"public/assets/bg_repeat_main.png")
}
export default preload_init;