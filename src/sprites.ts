
import { Version, getVersionKey, getGeneration } from './version.js'
import { Pokemon } from './pkmn_data.js'

const randomArray = [0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1];
function getSpriteURL(ver: Version, idx: number): string {
  const prefix = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
  const genStr = getGeneration(ver);

  if (genStr.length === 0) {
    return prefix + idx + ".png";
  } else {
    let verStr = getVersionKey(ver);
    if (verStr === "gold-silver") {
      // "randomly" switch between gold and silver, but be consistent to 
      // avoid switching
      verStr = randomArray[idx % randomArray.length] ? "gold" : "silver";
    }
    return prefix + "versions/" + genStr + "/" + verStr + "/" + idx + ".png";
  }
}

export function getSprite(pkmn: Pokemon): HTMLImageElement {
  const url = getSpriteURL(pkmn.version, pkmn.id);
  const img = document.createElement("img");
  img.src = url;
  img.style.width = "125px";
  img.style.height = "125px";
  img.style.position = "float";
  return img;
}