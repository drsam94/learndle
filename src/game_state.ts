import { GameData, Pokemon, LearnItem } from './pkmn_data.js';
import { makeRow } from './html_util.js'
import { getSprite } from './sprites.js';
import { getVersionKey } from './version.js';
import { convertMove } from './strutil.js';

enum MatchType {
  Match,
  LevelLower,
  LevelHigher,
  ByTM,
  ByEgg,
  ByTutor,
  NoMatch
};

export enum TableMode {
  LevelsOnly,
  GuessData
};

type LevelHint = [string, number, number];

export class GameState {
  private readonly data: GameData;
  private readonly targetMon: Pokemon;
  private guesses: Array<Pokemon>;

  constructor(data: GameData, mon: Pokemon) {
    this.data = data;
    this.targetMon = mon;
    this.guesses = [];
  }

  public addGuess(name: string): boolean {
    const mon = this.data.getPokemon(name);
    if (mon === null) {
      return false;
    }
    this.guesses.push(mon);
    return true;
  }

  private static findLearnItem(list: Array<LearnItem>, item: LearnItem): LearnItem | null {
    let bestMatch: LearnItem | null = null;
    for (const entry of list) {
      if (entry[1] === item[1]) {
        bestMatch = entry;
        if (entry[0] === item[0]) {
          return bestMatch;
        }
      }
    }
    return bestMatch;
  };

  public getMatchType(item: LearnItem): MatchType {
    const learnMatch = GameState.findLearnItem(this.targetMon.levelup, item);
    if (learnMatch !== null) {
      if (learnMatch[0] == item[0]) {
        return MatchType.Match;
      } else if (learnMatch[0] > item[0]) {
        return MatchType.LevelHigher;
      } else {
        return MatchType.LevelLower;
      }
    }
    const mapping: Array<[MatchType, string]> = [[MatchType.ByEgg, "egg"], [MatchType.ByTutor, "tutor"], [MatchType.ByTM, "machine"]];
    for (const entry of mapping) {
      const ls = this.targetMon.learnset[entry[1]];
      if (ls === undefined) {
        continue;
      }
      const match = GameState.findLearnItem(ls, item);
      if (match !== null) {
        return entry[0];
      }
    }

    return MatchType.NoMatch;
  }

  /// For a given pokemon, decode all the hint info from the moves
  private getAllHintInfo(pkmn: Pokemon): Map<MatchType, Array<LearnItem>> {
    const ret = new Map<MatchType, Array<LearnItem>>();
    for (const entry of pkmn.levelup) {
      const status = this.getMatchType(entry);
      if (!ret.has(status)) {
        ret.set(status, []);
      }
      ret.get(status)!.push(entry);
    }
    return ret;
  }

  private static getHintKeyLevel(item: LevelHint) {
    return item[1] > 0 ? item[1] : item[2];
  }

  private getAllHints(): [Map<MatchType, Set<string>>, Array<LevelHint>] {
    const catMap = new Map<MatchType, Set<string>>();
    const lvlMap = new Map<string, [number, number]>();
    for (const pkmn of this.guesses) {
      const info = this.getAllHintInfo(pkmn);
      info.forEach((moves: Array<LearnItem>, status: MatchType) => {
        for (const entry of moves) {
          const [level, move] = entry;
          switch (status) {
            case MatchType.ByEgg:
            case MatchType.ByTM:
            case MatchType.ByTutor:
            case MatchType.NoMatch:
              if (!catMap.has(status)) {
                catMap.set(status, new Set<string>());
              }
              catMap.get(status)!.add(move);
              break;
            case MatchType.Match:
              lvlMap.set(move, [level, level]);
              break;
            case MatchType.LevelHigher:
            case MatchType.LevelLower:
              const existing = lvlMap.get(move) ?? [0, 255];
              lvlMap.set(move, [status === MatchType.LevelHigher ? Math.max(level, existing[0]) : existing[0],
              status === MatchType.LevelLower ? Math.min(level, existing[1]) : existing[1]]);
              break;
          }
        }
      });
    }
    const sortedLvlMap: Array<LevelHint> = [];
    lvlMap.forEach((value: [number, number], key: string) => {
      sortedLvlMap.push([key, value[0], value[1]]);
    });
    sortedLvlMap.sort((a: LevelHint, b: LevelHint) => {
      return GameState.getHintKeyLevel(a) - GameState.getHintKeyLevel(b);
    });
    return [catMap, sortedLvlMap];
  }

  private static getTableColor(status: MatchType) {
    return {
      [MatchType.Match]: "#00ff80",
      [MatchType.LevelHigher]: "#00f0ff",
      [MatchType.LevelLower]: "#ff8000",
      [MatchType.NoMatch]: "#cccccc",
      [MatchType.ByTM]: "#e699ff",
      [MatchType.ByEgg]: "#ff99b3",
      [MatchType.ByTutor]: "#ff9999",
    }[status];
  }

  /// Get moves that are known for sure: this includes both moves where
  /// the clues have isolated the exact level, and also ones where by looking
  /// at the range and what levels the pokemon learns, we can deduce the exact
  /// level
  private getKnownMoves(levelKnowledge: Array<LevelHint>): Set<string> {
    const knownMoves = new Set<string>();
    for (let i = 0; i < levelKnowledge.length; ++i) {
      const item = levelKnowledge[i];
      if (item[1] === item[2]) {
        knownMoves.add(item[0]);
      } else {
        let matchingItems: Array<LearnItem> = [];
        for (const lvlItem of this.targetMon.levelup) {
          const level = lvlItem[0];
          if (level >= item[1] && level <= item[2]) {
            matchingItems.push(lvlItem);
          }
        }
        if (matchingItems.length === 1) {
          // Exactly one matching item, so we can view it as known
          item[1] = matchingItems[0][0];
          item[2] = matchingItems[0][0];
          knownMoves.add(item[0]);
        }
      }
    }
    return knownMoves;
  }

  private displayKnownInfo(outdiv: HTMLElement) {
    outdiv.replaceChildren("");
    const label = document.createElement("label");
    label.innerText = "Currently Guessing for " + getVersionKey(this.data.getVersion());
    outdiv.appendChild(label);
    const tablesDiv = document.createElement("div");
    tablesDiv.style = "display: flex; justify-content: center; flex-direction: row; gap: 20px;";
    outdiv.appendChild(tablesDiv);

    let [extraMoves, levelKnowledge] = this.getAllHints();
    let tgtIdx = 0;
    let knowIdx = 0;
    const knownMoves = this.getKnownMoves(levelKnowledge);
    const tableDiv = document.createElement("div");
    const table = document.createElement("table");
    table.className = "mytable";
    tableDiv.appendChild(table);
    table.appendChild(makeRow(["level", "move"]));
    while (tgtIdx < this.targetMon.levelup.length || knowIdx < levelKnowledge.length) {
      const tgtLevel = tgtIdx === this.targetMon.levelup.length ? 255 : this.targetMon.levelup[tgtIdx][0];
      const knowLevel = knowIdx === levelKnowledge.length ? 255 : GameState.getHintKeyLevel(levelKnowledge[knowIdx]);
      if (tgtLevel < 255) {
        const move = this.targetMon.levelup[tgtIdx][1];
        let rowElem: HTMLTableRowElement | null = null;
        if (knownMoves.has(move)) {
          rowElem = makeRow([tgtLevel + "", convertMove(move)]);
          rowElem.style.backgroundColor = GameState.getTableColor(MatchType.Match);
          if (this.targetMon.types.indexOf(this.data.moveData.getMoveType(move)) != -1) {
            // This is STAB
            rowElem.style.fontWeight = "700";
          }
        } else if (tgtLevel < knowLevel) {
          rowElem = makeRow([tgtLevel + "", "?"]);
        }
        if (rowElem != null) {
          table.appendChild(rowElem);
          ++tgtIdx;
          continue;
        }
      }
      const [move, low, high] = levelKnowledge[knowIdx];
      if (!knownMoves.has(move)) {
        const levelStr = low === 0 ? `-${high}` : high === 255 ? `${low}-` : `${low}-${high}`;
        const rowElem = makeRow([levelStr, convertMove(move)]);
        rowElem.style.backgroundColor = GameState.getTableColor(low === 0 ? MatchType.LevelLower : MatchType.LevelHigher);
        table.appendChild(rowElem);
      }
      ++knowIdx;
    }
    tablesDiv.appendChild(tableDiv);

    extraMoves.forEach((moves: Set<string>, type: MatchType) => {
      let i = 0;
      const moveA = [...moves];
      while (i < moveA.length) {
        const tableDiv = document.createElement("div");
        const table = document.createElement("table");
        table.className = "mytable";
        table.appendChild(makeRow([MatchType[type]]));
        tableDiv.appendChild(table);
        for (let j = 0; i < moveA.length && j < Math.max(15, moveA.length / 5); ++i) {
          const rowElem = makeRow([convertMove(moveA[i])]);
          rowElem.style.backgroundColor = GameState.getTableColor(type);
          table.appendChild(rowElem);
          ++j;
        }
        tablesDiv.appendChild(tableDiv);
      }
    });
    outdiv.appendChild(tablesDiv);
  }

  private makeMoveTable(pkmn: Pokemon, mode: TableMode): HTMLTableElement {
    const table = document.createElement("table");
    table.className = "mytable";
    table.appendChild(makeRow(["level", "move"]));
    for (const entry of pkmn.levelup) {
      if (mode == TableMode.LevelsOnly) {
        const row = ["" + entry[0], "?"];
        table.appendChild(makeRow(row));
        continue;
      }
      const status = this.getMatchType(entry);
      const row = [entry[0] + "", convertMove(entry[1])];
      const rowElem = makeRow(row);
      rowElem.style.backgroundColor = GameState.getTableColor(status);
      if (pkmn.types.indexOf(this.data.moveData.getMoveType(entry[1])) != -1) {
        // This is STAB
        rowElem.style.fontWeight = "700";
      }
      table.appendChild(rowElem);
    }
    return table;
  }

  public renderGuesses(outdiv: HTMLDivElement, headerdiv: HTMLElement): void {
    outdiv.replaceChildren("");

    this.displayKnownInfo(headerdiv);
    for (let i = this.guesses.length - 1; i >= 0; --i) {

      const pkmn = this.guesses[i];
      const wrapperDiv = document.createElement("div");
      wrapperDiv.style.padding = "5px";

      const labelDiv = document.createElement("div");
      const label = document.createElement("p");
      label.innerText = pkmn.name;
      if (pkmn.name.toLowerCase() === this.targetMon.name.toLowerCase()) {
        label.innerText += ` -- You Won in ${this.guesses.length} tries!`;
      }
      labelDiv.appendChild(label);
      labelDiv.appendChild(getSprite(pkmn));
      wrapperDiv.appendChild(labelDiv);
      wrapperDiv.appendChild(this.makeMoveTable(pkmn, TableMode.GuessData));

      outdiv.appendChild(wrapperDiv);
    }
  }
};