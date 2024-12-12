export default class Player extends Phaser.Physics.Arcade.Sprite {
    playerName?: Phaser.GameObjects.Text
    direction = "down";

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, name: string) {
        super(scene, x, y, texture);

        // Add player to the scene with physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set properties like bounce
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        
        this.setScale(1.5);
        this.body?.setSize(16, 16);
        this.body?.setOffset(16, 28);

        // Add player name text
        this.playerName = scene.add.text(this.x, this.y - 20, name, {
            fontSize: "8px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // Add update function for text positioning
        scene.events.on('update', this.update, this);
    }

    setSpeed(vx: number, vy: number) {
        this.setVelocity(vx, vy);
        
        const state = (vx || vy) ? "walk" : "idle";

        if(vx) this.direction = (vx > 0) ? "right" : "left";
        else if(vy) this.direction = (vy > 0) ? "down" : "up";

        this.anims.play(state + '_' + this.direction, true);
    }

    // Override update to keep the text above the player
    update() {
        this.playerName?.setPosition(this.x, this.y - 24);
    }

    destroy(fromScene?: boolean): void {
        super.destroy(fromScene);
        this.playerName?.destroy(fromScene);
    }
}
