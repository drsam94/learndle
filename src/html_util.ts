export interface PseudoKeyboardEvent {
  key: string
};

export function styleSetup(): void {
  const style = document.createElement("style");
  let cssText = ".mytable { border: 1px solid black; }\n";
  cssText += "table.mytable { margin: auto; }";
  const cssStyleNode = document.createTextNode(cssText);
  style.appendChild(cssStyleNode);
  document.head.appendChild(style);
  let cssText2 = ".autocomplete-items div:hover { background-color: #e9e9e9; }";
  cssText2 += "\n.autocomplete-active { background-color: DodgerBlue !important; color: #ffffff; }";
  cssText2 += "\n* { box-sizing: border-box; }";
  const cssStyleNode2 = document.createTextNode(cssText2);
  style.appendChild(cssStyleNode2);
}

export function makeRow(elems: Array<string>): HTMLTableRowElement {
  const row = document.createElement("tr");
  row.className = "mytable";
  for (const elem of elems) {
    const entry = document.createElement("td");
    entry.className = "mytable";
    entry.innerHTML = elem;
    row.appendChild(entry);
  }

  return row;
}