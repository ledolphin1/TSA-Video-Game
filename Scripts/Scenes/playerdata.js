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
    }
}
export const playerData = new PlayerData;