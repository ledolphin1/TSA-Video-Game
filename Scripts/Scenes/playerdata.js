import * as Phaser from "phaser";
class PlayerData {
    constructor(){
        this.didLoadOverworld = false;

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
        this.stats = {
            enemyKills: 0,
            damageTaken: 0,
            deaths: 0,
            projectilesFired: 0,
            meleeAttacks: 0,
            bossesDefeated: 0
        };
    }

    resetRunStats(){
        this.stats.enemyKills = 0;
        this.stats.damageTaken = 0;
        this.stats.deaths = 0;
        this.stats.projectilesFired = 0;
        this.stats.meleeAttacks = 0;
        this.stats.bossesDefeated = 0;
    }
}
export const playerData = new PlayerData;