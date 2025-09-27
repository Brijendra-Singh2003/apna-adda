import { Scene } from "phaser";
import { Player } from "../scripts/Player";
import { InputHandler } from "../scripts/InputHandler";
import { EventBus } from "../EventBus";

export class Demo extends Scene {
  private player!: Player;
  private inputHandler!: InputHandler;
  private triggerZones: Phaser.Physics.Arcade.Group | undefined;

  public isInside: boolean = false;

  static onEnterZone: (zoneName: string) => void;
  static onExitZone: () => void;

  constructor() {
    super("Demo");
  }

  private setupManualTriggerZones(map: Phaser.Tilemaps.Tilemap) {
    const objectLayer = map.getObjectLayer("chatZone");

    if (!objectLayer) return;

    this.triggerZones = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    objectLayer.objects.forEach((obj) => {
      const zone = this.add
        .zone(obj.x!, obj.y!, obj.width!, obj.height!)
        .setOrigin(0, 0);

      this.physics.world.enable(zone);
      (zone.body as Phaser.Physics.Arcade.Body).setImmovable(true);

      this.triggerZones!.add(zone);

      // Collision/Overlap event
      this.physics.add.overlap(
        this.player as unknown as Phaser.Physics.Arcade.Sprite,
        zone,
        () => {
          console.log("Player entered trigger zone:", obj);
          EventBus.emit("player-enter-zone", obj.name || obj.id);
        }
      );
      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0x00ff00, 1);
      graphics.strokeRect(obj.x!, obj.y!, obj.width!, obj.height!);
    });
  }

  preload() {
    // Load the map JSON
    this.load.tilemapTiledJSON("map", "/assets/maps/parks.tmj");

    // Load the tileset images
    this.load.image("floor-tiles", "/floor-tiles.png");
    this.load.image("grassTile", "/grassTile.jpg");

    // Load player sprite sheets
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

    // Add the tilesets (names must match "name" in your tmj)
    const grass_tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage(
      "grassTile",
      "grassTile"
    )!;
    const floor_tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage(
      "floor-tiles",
      "floor-tiles"
    )!;

    // Create the layer with both tilesets
    const layer1 = map.createLayer(
      "Tile Layer 1",
      [grass_tileset, floor_tileset],
      0,
      0
    );

    // Set world bounds to match the map size
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Set collision properties for layers if needed
    if (layer1) {
      // Example: set collision for specific tile IDs if you want certain tiles to be solid
      // layer1.setCollisionByProperty({ collides: true });
      // layer1.setCollisionBetween(40, 41); // Example: make certain floor tiles collidable
    }

    // Create player at spawn position
    const playerSpawnX = 200; // Adjust based on your map (avoid spawning at edge)
    const playerSpawnY = 200; // Adjust based on your map (avoid spawning at edge)
    this.player = new Player(this, playerSpawnX, playerSpawnY, "idle");
    this.setupManualTriggerZones(map);

    // Set up collision between player and map layers if needed
    if (layer1) {
      // Only add this if you want the player to collide with certain tiles
      // this.physics.add.collider(this.player, layer1);
    }

    // Create input handler
    this.inputHandler = new InputHandler(this, this.player, {
      enableWASD: true,
      enableArrowKeys: true,
      enableTouch: false,
      enableGamepad: false,
    });

    // Camera setup
    this.cameras.main.setBackgroundColor("#4a4a4a");
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Optional: Set camera zoom for better view
    this.cameras.main.setZoom(1);

    // Debug: Show world bounds (remove in production)
    if (process.env.NODE_ENV === "development") {
      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0xff0000, 1);
      graphics.strokeRect(0, 0, map.widthInPixels, map.heightInPixels);
      console.log(`World bounds: ${map.widthInPixels} x ${map.heightInPixels}`);
      console.log(`Player spawn: ${playerSpawnX}, ${playerSpawnY}`);
    }

    EventBus.emit("current-scene-ready", this);
  }

  update() {
    this.inputHandler.update();
    this.player.update();

    // Optional: Manual bounds checking (as backup)
    if (this.player) {
      const bounds = this.physics.world.bounds;

      // Clamp player position within world bounds
      this.player.x = Phaser.Math.Clamp(
        this.player.x,
        bounds.x + this.player.displayWidth / 2,
        bounds.x + bounds.width - this.player.displayWidth / 2
      );

      this.player.y = Phaser.Math.Clamp(
        this.player.y,
        bounds.y + this.player.displayHeight / 2,
        bounds.y + bounds.height - this.player.displayHeight / 2
      );
    }
  }

  destroy() {
    if (this.inputHandler) {
      this.inputHandler.destroy();
    }
  }
}
