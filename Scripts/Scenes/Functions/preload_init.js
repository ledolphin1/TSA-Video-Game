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
    this.load.audio('background', "public/assets/audio/background_music_filler.mp3");
    this.load.image('tiles', "public/assets/Map/tileset.png");
    this.load.image('lpProjectile',"public/assets/projectile.png")
}
export default preload_init;