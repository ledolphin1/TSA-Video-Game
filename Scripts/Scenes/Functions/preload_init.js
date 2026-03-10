const preload_init = function (){
    this.load.spritesheet('enemySprite', 'assets/snakeMob.png', {
      frameWidth: 22,
      frameHeight: 11
    }); // enemy spritesheet
    
    this.load.spritesheet('player_attack_sheet', 'assets/mainCharacterAttack.png', {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.image("frame", "assets/ARCADE_BORDER.png")
   this.load.image('player_still', 'assets/Main Character Standing SSl.png'); //player image
   this.load.spritesheet("player_jumping", 'assets/Main Character Jump SS.png', {
     frameWidth: 16,
     frameHeight: 16
    })
    this.load.spritesheet('player_running', 'assets/Main Character Running SS.png', {
      frameWidth: 16,
      frameHeight: 16
    })
    this.load.audio('background', 'assets/audio/background_music_filler.mp3');
    this.load.image('tiles', 'assets/Map/tileset.png');
    this.load.image('lpProjectile','assets/projectile.png')
}
export default preload_init;