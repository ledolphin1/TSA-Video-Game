import { playerData } from "../playerdata";

  const selectAbility = function (time) {
    switch (playerData.weapon){
        case "lp":
            this.fireProjectile(time);
            break;
        case "wave":
            this.waveProj(time);
            break;
        case "poison":
            this.poison(time);
            break;
        case "hyper":
            this.hyper(time);
            break;
    }
  }
  export default selectAbility;