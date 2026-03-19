import { playerData } from "../playerdata.js";

  const selectAbility = function (time, weaponName, slot = 2) {
    switch (weaponName){
        case "lp":
            this.fireProjectile(time, slot);
            break;
        case "wave":
            this.waveProj(time, slot);
            break;
        case "poison":
            this.poison(time, slot);
            break;
        case "hyper":
            this.hyper(time, slot);
            break;
    }
  }
  export default selectAbility;