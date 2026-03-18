import * as Phaser from "phaser";
class PlayerData {
    constructor(){
        this.weapon = "lp";
        this.lpProjectileCount = 0;
        this.plasmaSaberCount = 0;
        this.currentScene = "intro";
        this.didMove= false;
        this.didJump= false;
        this.didAttack = false;
        this.currentScene = false;
        this.transitionX = 0;
        this.transitionY = 0;
        this.didBeatS1 = false;
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