import { Scene } from "phaser";
import { Player } from "../scripts/Player";
import { InputHandler } from "../scripts/InputHandler";
import { EventBus } from "../EventBus";

export class Demo extends Scene {
  private player!: Player;
  private inputHandler!: InputHandler;

  constructor() {
    super("Demo");
  }

  preload() {
    // Load the map JSON
    this.load.tilemapTiledJSON("map", "/forUse/view1.tmj");

    // Load the tileset image (adjust the path to where the PNG really is)
    this.load.image("WpTSrE", "/forUse/tileset/WpTSrE.png");

    // Load player sprite sheet (you'll need to add your player sprite)
    // Example assuming a 16x16 sprite with 4x4 grid (16 frames total)
    this.load.spritesheet("player", "/forUse/player.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("walk", "Walk/walk.png", {
      frameWidth: 48,
      frameHeight: 64,
    });
    this.load.spritesheet("idle", "Idle/idle.png", {
      frameWidth: 48,
      frameHeight: 64,
    });
  }

  create() {
    // Create the map
    const map = this.make.tilemap({ key: "map" });

    // Add the tileset (name must match "name" in your tmj)
    const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage(
      "WpTSrE",
      "WpTSrE"
    )!;

    // Create both layers
    const layer1 = map.createLayer("Tile Layer 1", tileset, 0, 0);
    const layer2 = map.createLayer("whatevs", tileset, 0, 0);

    // Set collision properties for layers if needed
    if (layer1) {
      // Example: set collision for specific tile IDs
      // layer1.setCollisionByProperty({ collides: true });
    }

    // Create player at spawn position
    const playerSpawnX = 100; // TODO: Adjust based on map
    const playerSpawnY = 100; // TODO: Adjust based on map
    this.player = new Player(this, playerSpawnX, playerSpawnY, "idle");

    // Set up collision between player and map layers
    if (layer1) {
      this.physics.add.collider(this.player, layer1);
    }
    if (layer2) {
      this.physics.add.collider(this.player, layer2);
    }

    this.inputHandler = new InputHandler(this, this.player, {
      enableWASD: true,
      enableArrowKeys: true,
      enableTouch: false,
      enableGamepad: false,
    });

    this.cameras.main.setBackgroundColor("#000");
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    EventBus.emit("current-scene-ready", this);
  }

  update() {
    this.inputHandler.update();
    this.player.update();
  }

  destroy() {
    if (this.inputHandler) {
      this.inputHandler.destroy();
    }
    super.destroy();
  }
}
