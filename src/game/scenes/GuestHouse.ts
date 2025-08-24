import { Scene } from "phaser";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../main";

export class GuestHouse extends Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.image("grass", "grassTile.jpg");
    this.load.image("bush 1", "bush1.png");
    this.load.image("couch 1", "couch1.png");
  }

  create() {
    this.add.image(0, 0, "grass");
    this.add
      .tileSprite(
        WORLD_WIDTH / 2, // Center the tile sprite horizontally
        WORLD_HEIGHT / 2, // Center the tile sprite vertically
        WORLD_WIDTH * 2, // Full width of the world
        WORLD_HEIGHT * 2, // Full height of the world
        "grass" // Key of the floor texture
      )
      .setScale(0.5);
  }

  update(time: number, delta: number): void {}
}
