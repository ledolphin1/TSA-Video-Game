import * as Phaser from 'phaser';

export default class Intro extends Phaser.Scene {
  constructor() {
    super({ key: 'Intro' });
  }
  preload(){
    this.load.video("intro_vid","./Assets/Intro.mp4",true)
  }
  create() {
    const video = this.add.video(0, 0, 'intro_vid');
    video.setOrigin(0,0)
    video.play(false); // false = do NOT loop
    video.on('complete', () => {
        this.scene.start('Menu');
    });


  }
}
