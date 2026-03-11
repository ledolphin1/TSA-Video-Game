const preload_init = function (){
    this.load.spritesheet('enemySprite', "public/assetssnakeMob.png", {
      frameWidth: 22,
      frameHeight: 11
    }); // enemy spritesheet
    
    this.load.spritesheet('player_attack_sheet', "public/assetsmainCharacterAttack.png", {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.image("frame", "public/assetsARCADE_BORDER.png")
   this.load.image('player_still', "public/assetsMain Character Standing SSl.png"); //player image
   this.load.spritesheet("player_jumping", "public/assetsMain Character Jump SS.png", {
     frameWidth: 16,
     frameHeight: 16
    })
    this.load.spritesheet('player_running', "public/assetsMain Character Running SS.png", {
      frameWidth: 16,
      frameHeight: 16
    })
    this.load.audio('background', "public/assetsaudio/background_music_filler.mp3");
    this.load.image('tiles', "public/assetsMap/tileset.png");
    this.load.image('lpProjectile',"public/assetsprojectile.png")
}
export default preload_init;