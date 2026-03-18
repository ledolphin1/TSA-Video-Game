import * as Phaser from "phaser";
class PlayerData {
    constructor(){
        
        this.weapons = ["lp"];
        this.weapon = "lp";
        
        
        //milestones (don't reset if restarting level[use old playerData])
        this.didMove= false;
        this.didJump= false;
        this.didAttack = false;
        this.currentScene = false;
        this.transitionX = 0;
        this.transitionY = 0;
        
        //level milestones
        this.didBeatL1 = false;
        this.didBeatL2 = false;
        this.didBeatS1 = false;
        this.didBeatBoss = false;
    }
}
export const playerData = new PlayerData;