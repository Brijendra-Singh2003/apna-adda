import { Boot } from "./scenes/Boot";
import { AUTO, Game } from "phaser";
import { Demo } from "./scenes/Demo";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const gameConfig: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: "game-container",
  backgroundColor: "#028af8",
  physics: {
    default: "arcade",
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, Demo],
};

const StartGame = (parent: string) => {
  return new Game({ ...gameConfig, parent });
};

export default StartGame;
