const preload_init = function (){
    this.load.spritesheet('enemySprite', 'Assets/snakeMob.png', {
      frameWidth: 22,
      frameHeight: 11
    }); // enemy spritesheet
    
    this.load.spritesheet('player_attack_sheet', 'Assets/mainCharacterAttack.png', {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.image("frame", "Assets/ARCADE_BORDER.png")
   this.load.image('player_still', 'Assets/Main Character Standing SSl.png'); //player image
   this.load.spritesheet("player_jumping", 'Assets/Main Character Jump SS.png', {
     frameWidth: 16,
     frameHeight: 16
    })
    this.load.spritesheet('player_running', 'Assets/Main Character Running SS.png', {
      frameWidth: 16,
      frameHeight: 16
    })
    this.load.audio('background', 'Assets/audio/background_music_filler.mp3');
    this.load.image('tiles', 'Assets/Map/tileset.png');
    this.load.image('lpProjectile','Assets/projectile.png')
}
export default preload_init;