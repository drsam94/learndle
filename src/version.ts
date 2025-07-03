
export enum Version {
  RB,
  Yellow,
  GS,
  Crystal,
  RS,
  FRLG,
  Emerald,
  DP,
  Platinum,
  HGSS,
  BW,
  B2W2,
  XY,
  Colosseum,
  XD,
  ORAS,
  SM,
  USUM,
  LetsGo,
  SS,
  IsleOfArmor,
  CrownTundra,
  BDSP,
  LegendsArceus,
  SV,
  TealMask,
  IndigoDisk,
  RGJ,
  BlueJapan,
};

export function getVersionKey(ver: Version): string {
  switch (ver) {
    case Version.RB:
      return "red-blue";
    case Version.Yellow:
      return "yellow";
    case Version.GS:
      return "gold-silver";
    case Version.Crystal:
      return "crystal";
    case Version.RS:
      return "ruby-sapphire";
    case Version.FRLG:
      return "firered-leafgreen";
    case Version.Emerald:
      return "emerald";
    case Version.DP:
      return "diamond-pearl";
    case Version.Platinum:
      return "platinum";
    case Version.HGSS:
      return "heartgold-soulsilver";
    case Version.BW:
      return "black-white";
    case Version.B2W2:
      return "black-2-white-2";
    case Version.XY:
      return "x-y";
    case Version.Colosseum:
      return "colosseum";
    case Version.XD:
      return "xd";
    case Version.ORAS:
      return "omega-ruby-alpha-sapphire";
    case Version.SM:
      return "sun-moon";
    case Version.USUM:
      return "ultra-sun-ultra-moon";
    case Version.LetsGo:
      return "lets-go-pikachu-lets-go-evee";
    case Version.SS:
      return "sword-shield";
    case Version.IsleOfArmor:
      return "the-isle-of-armor";
    case Version.CrownTundra:
      return "the-crown-tundra";
    case Version.BDSP:
      return "brilliant-diamond-shining-pearl";
    case Version.LegendsArceus:
      return "legends-arceus";
    case Version.SV:
      return "scarlet-violet";
    case Version.TealMask:
      return "the-teal-mask";
    case Version.IndigoDisk:
      return "the-indigo-disk";
    case Version.RGJ:
      return "red-green-japan";
    case Version.BlueJapan:
      return "blue-japan";
  }
}

export function getGeneration(ver: Version): string {
  switch (ver) {
    case Version.RB:
    case Version.Yellow:
    case Version.BlueJapan:
    case Version.RGJ:
      return "generation-i";
    case Version.GS:
    case Version.Crystal:
      return "generation-ii";
    case Version.RS:
    case Version.FRLG:
    case Version.Emerald:
    case Version.Colosseum:
    case Version.XD:
      return "generation-iii";
    case Version.DP:
    case Version.Platinum:
    case Version.HGSS:
      return "generation-iv";
    case Version.BW:
    case Version.B2W2:
      return "generation-v";
    case Version.XY:
    case Version.ORAS:
      return "generation-vi";
    case Version.SM:
    case Version.USUM:
      return "";
    case Version.LetsGo:
    case Version.SS:
    case Version.IsleOfArmor:
    case Version.CrownTundra:
    case Version.BDSP:
    case Version.LegendsArceus:
    case Version.SV:
    case Version.TealMask:
    case Version.IndigoDisk:
      return "";
  }
}