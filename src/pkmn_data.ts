import { capitalize } from "./strutil.js"
import { Version, getVersionKey } from "./version.js"

export type LearnItem = [number, string];
export type PokemonJson = Record<string, Array<LearnItem> | number>;
export type Learnset = Record<string, Array<LearnItem>>;
export type VersionedPokemonData = Record<string, PokemonJson>;
export type AllPokemonData = Record<string, VersionedPokemonData>;


export function getPokemonNames(all_pokemon: AllPokemonData): Array<string> {
  const retMap: Record<string, null> = {}
  for (const version of Object.keys(all_pokemon)) {
    for (const name of Object.keys(all_pokemon[version])) {
      retMap[capitalize(name)] = null;
    }
  }
  return Object.keys(retMap);
}

export class Pokemon {
  public readonly name: string;
  public readonly learnset: Learnset;
  public readonly levelup: Array<LearnItem>;
  public readonly id: number;
  public readonly version: Version;

  constructor(name: string, pkmn: PokemonJson, version: Version) {
    this.name = name;
    this.version = version;
    this.learnset = {};
    for (const key in pkmn) {
      if (key === "id" || key === "level-up") {
        continue;
      }
      this.learnset[key] = pkmn[key] as Array<LearnItem>;
    }

    this.id = pkmn["id"] as number;
    const levelup = [...(pkmn["level-up"] as Array<LearnItem>)];
    levelup.sort((a, b) => a[0] - b[0]);

    this.levelup = levelup;
  }

};

export class GameData {
  private version: Version;
  private readonly pkmnData: AllPokemonData;

  public constructor(v: Version, d: AllPokemonData) {
    this.version = v;
    this.pkmnData = d;
  }

  public getPokemon(name: string): Pokemon | null {
    const nameKey = name.toLowerCase();
    const ver = this.pkmnData[getVersionKey(this.version)];
    if (!(nameKey in ver)) {
      return null;
    }
    return new Pokemon(name, ver[nameKey], this.version);
  }

  public getRandom(): Pokemon {
    const ver = this.pkmnData[getVersionKey(this.version)];
    const keys = Object.keys(ver);
    const idx = ~~(Math.random() * keys.length);
    return this.getPokemon(keys[idx])!;
  }

  public setVersion(ver: Version): void {
    this.version = ver;
  }

  public getVersion(): Version {
    return this.version;
  }
};