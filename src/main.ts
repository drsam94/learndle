// Author: Sam Donow, 2025

import { autocomplete } from './autocomplete.js';
import { getVersionKey, Version } from './version.js';
import { PseudoKeyboardEvent, styleSetup } from './html_util.js'
import { AllPokemonData, GameData, getPokemonNames } from './pkmn_data.js'
import { GameState } from './game_state.js'

function makeGuessBar(all_pokemon: Array<string>, callback: (_: string) => any): [HTMLDivElement, HTMLInputElement] {
  const wrapperDiv = document.createElement("div");
  wrapperDiv.style.position = "relative";
  wrapperDiv.style.display = "inline-block";
  wrapperDiv.style.width = "300px";
  wrapperDiv.style.padding = "5px";
  const inputElem = document.createElement("input");

  inputElem.type = "text";
  inputElem.placeholder = "Guess a pokemon...";
  inputElem.style.border = "1px solid transparent";
  inputElem.style.backgroundColor = "#f1f1f1";
  inputElem.style.padding = "10px";
  inputElem.style.fontSize = "16px";
  inputElem.style.width = "100%";
  const cb = (event: PseudoKeyboardEvent) => {
    if (event.key != "Enter") {
      return;
    }
    callback(inputElem.value);
  };
  autocomplete(inputElem, all_pokemon, cb);

  wrapperDiv.appendChild(inputElem);
  return [wrapperDiv, inputElem];
}

function main(): void {
  styleSetup();
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      mainOnLoad(JSON.parse(xhttp.responseText));
    }
  }
  xhttp.open("GET", "res/all_pokemon.json", true);
  xhttp.send();
}

function makeGuess(outdiv: HTMLDivElement, headerdiv: HTMLDivElement, guess: string, state: GameState): void {

  const result = state.addGuess(guess);
  if (!result) {
    outdiv.innerHTML = guess + " is not a valid pokemon";
    return;
  }
  state.renderGuesses(outdiv, headerdiv);
}

class CurrentGame {
  public state: GameState | null = null;

  private outdiv: HTMLDivElement;
  private headerDiv: HTMLDivElement;
  private allData: AllPokemonData;
  constructor(allData: AllPokemonData, outdiv: HTMLDivElement, headerDiv: HTMLDivElement) {
    this.allData = allData;
    this.outdiv = outdiv;
    this.headerDiv = headerDiv;
  }

  public guessCallback(): (g: string) => void {
    return (g: string) => makeGuess(this.outdiv, this.headerDiv, g, this.state!);
  }

  public startGame(ver: Version): void {
    const data = new GameData(ver, this.allData);
    const target = data.getRandom();
    this.state = new GameState(data, target);
    this.state.renderGuesses(this.outdiv, this.headerDiv);
  }
};

function mainOnLoad(all_pokemon: AllPokemonData): void {
  const headerDiv = document.createElement("div");
  const staticDiv = document.createElement("div");
  const outdiv = document.createElement("div");
  const currentGame = new CurrentGame(all_pokemon, outdiv, headerDiv);
  const [guessBar, guessElem] = makeGuessBar(getPokemonNames(all_pokemon), currentGame.guessCallback());

  currentGame.startGame(Version.RB);
  const containerDiv = document.createElement("div");
  containerDiv.style.display = "flex";
  containerDiv.style.textAlign = "center";
  containerDiv.style.justifyContent = "center";
  containerDiv.style.flexDirection = "column";
  containerDiv.appendChild(headerDiv);
  containerDiv.appendChild(staticDiv);
  containerDiv.appendChild(outdiv);

  const optionsDiv = document.createElement("div");
  const selector = document.createElement("select");
  const startButton = document.createElement("button");

  for (const [name, ver] of Object.entries(Version)) {
    if (typeof ver === "string") {
      // Junk in the loop... this language is weird
      // we want to iterate over all Version values
      continue;
    }
    const option = document.createElement("option");
    const keyStr = getVersionKey(ver as Version);
    option.value = name;
    option.innerText = keyStr;
    selector.appendChild(option);
  }
  const startSelectedGame = () => {
    guessElem.value = "";
    currentGame.startGame(Version[selector.value as keyof typeof Version]);
  };
  selector.onchange = startSelectedGame;
  startButton.onclick = startSelectedGame;
  startButton.innerText = "New Game";

  optionsDiv.appendChild(selector);
  optionsDiv.appendChild(startButton);
  staticDiv.appendChild(optionsDiv);
  staticDiv.appendChild(guessBar);
  document.body.appendChild(containerDiv);
}


main();