import Phaser from 'phaser';
import { playerData } from './playerData';

export default class pickAbility extends Phaser.Scene {
  constructor() {
    super({ key: 'pickAbility' });
  }

  preload(){
    this.load.bitmapFont("arcade_font","/Assets/PressStart.png","/Assets/PressStart.xml");
    this.load.image("card_01","/Assets/wave_card.png")
    this.load.image("card_01_H","/Assets/wave_card_highlighted.png")
  }
  create() {
    const { width, height } = this.scale;
    // Title text
    
    this.add.bitmapText(width / 2, 15,"arcade_font", "Upgrade",16).setOrigin(0.5);
    const wave = this.add.image(width/2, 100,"card_01").setOrigin(0.5).setInteractive({useHandCursor:true});
    wave.on('pointerover', () => {
      wave.setTexture("card_01_H");
    });
   wave.on('pointerout', () => {
    wave.setTexture("card_01");
  });
  wave.on('pointerdown', () => {
      this.scene.start('boss');
      playerData.specialWeapon = 1;
      console.log(this.specialWeapon)
    });
  }
}
