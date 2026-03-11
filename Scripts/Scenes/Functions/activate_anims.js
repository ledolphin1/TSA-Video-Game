import * as Phaser from "phaser";
const activate_anims = function(){
     //Activate all animations
     this.anims.create({
      key: "player_moving",
      frames: this.anims.generateFrameNumbers("player_running"),
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
      key: "player_jump_start",
      frames: this.anims.generateFrameNumbers("player_jumping", {
        start: 0,
        end: 5
      }),
      frameRate: 10,
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
      key: "player_falling",
      frames: this.anims.generateFrameNumbers("player_jumping", {
        start: 6,
        end: 8
      }),
      frameRate: 10,
      repeat: 0,
      hideOnComplete: false
    })

}
export default activate_anims;