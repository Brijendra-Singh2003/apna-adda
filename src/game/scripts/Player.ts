import { Scene } from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
    private walkSpeed: number;
    private isMoving: boolean;
    private lastDirection: "down" | "left" | "up" | "right";
    private animationState: "idle" | "walk";
    private vx: number = 0;
    private vy: number = 0;
    private nameText: Phaser.GameObjects.Text | null;

    constructor(scene: Scene, x: number, y: number, texture: string = "idle", name?: string) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.walkSpeed = 160; // Using your PLAYER_VELOCITY constant value
        this.isMoving = false;
        this.lastDirection = "down";
        this.animationState = "idle";
        this.nameText = null;

        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set physics properties to match your existing setup
        this.setCollideWorldBounds(true);
        this.setScale(1.5);
        this.setBounce(0.2);

        // Set body size and offset to match your existing player
        this.body?.setSize(16, 16);
        this.body?.setOffset(16, 28);

        // Create animations
        this.createAnimations();

        // Start with idle down animation
        this.play("idle_down");

        if (name) {
            this.nameText = this.scene.add.text(x, y - 40, name, {
                fontSize: "12px",
                fontFamily: "Arial",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 2,
                align: "center",
            });
            this.nameText.setOrigin(0.5);
        }
    }

    public update(): void {
        if (this.nameText) {
            this.nameText.setPosition(this.x, this.y - 40);
        }
    }

    private createAnimations(): void {
        const anims = this.anims;

        // Check if animations already exist to avoid duplicates
        if (!anims.exists("idle_down")) {
            // Idle animations
            anims.create({
                key: "idle_down",
                frames: anims.generateFrameNumbers("idle", { start: 0, end: 7 }),
                frameRate: 12,
                repeat: -1,
            });

            anims.create({
                key: "idle_left",
                frames: anims.generateFrameNumbers("idle", { start: 8, end: 15 }),
                frameRate: 12,
                repeat: -1,
            });

            anims.create({
                key: "idle_right",
                frames: anims.generateFrameNumbers("idle", { start: 40, end: 47 }),
                frameRate: 12,
                repeat: -1,
            });

            anims.create({
                key: "idle_up",
                frames: anims.generateFrameNumbers("idle", { start: 24, end: 31 }),
                frameRate: 12,
                repeat: -1,
            });

            // Walking animations
            anims.create({
                key: "walk_down",
                frames: anims.generateFrameNumbers("walk", { start: 0, end: 7 }),
                frameRate: 12,
                repeat: -1,
            });

            anims.create({
                key: "walk_left",
                frames: anims.generateFrameNumbers("walk", { start: 8, end: 15 }),
                frameRate: 12,
                repeat: -1,
            });

            anims.create({
                key: "walk_right",
                frames: anims.generateFrameNumbers("walk", { start: 40, end: 47 }),
                frameRate: 12,
                repeat: -1,
            });

            anims.create({
                key: "walk_up",
                frames: anims.generateFrameNumbers("walk", { start: 24, end: 31 }),
                frameRate: 12,
                repeat: -1,
            });
        }
    }

    public moveUp(): void {
        this.vy = -this.walkSpeed;
        this.lastDirection = "up";
        this.updateMovementState();
    }

    public moveDown(): void {
        this.vy = this.walkSpeed;
        this.lastDirection = "down";
        this.updateMovementState();
    }

    public moveLeft(): void {
        this.vx = -this.walkSpeed;
        this.lastDirection = "left";
        this.updateMovementState();
    }

    public moveRight(): void {
        this.vx = this.walkSpeed;
        this.lastDirection = "right";
        this.updateMovementState();
    }

    public stopHorizontal(): void {
        this.vx = 0;
        this.updateMovementState();
    }

    public stopVertical(): void {
        this.vy = 0;
        this.updateMovementState();
    }

    public stop2D() {
        this.vx = 0;
        this.vy = 0;
        this.updateMovementState();
    }

    private updateMovementState(): void {
        // Apply diagonal movement normalization like in your original code
        if (this.vx && this.vy) {
            this.vx *= Math.SQRT1_2;
            this.vy *= Math.SQRT1_2;
        }

        // Determine state
        this.animationState = this.vx || this.vy ? "walk" : "idle";
        this.isMoving = this.animationState === "walk";

        // Play appropriate animation
        this.play(this.animationState + "_" + this.lastDirection, true);

        // Set velocity
        this.setVelocity(this.vx, this.vy);
    }

    // Getter methods to maintain compatibility with your existing code
    public getIsMoving(): boolean {
        return this.isMoving;
    }

    public getLastDirection(): "down" | "left" | "up" | "right" {
        return this.lastDirection;
    }

    public getState(): "idle" | "walk" {
        return this.animationState;
    }

    public getVelocityX(): number {
        return this.vx;
    }

    public getVelocityY(): number {
        return this.vy;
    }

    public setWalkSpeed(speed: number): void {
        this.walkSpeed = speed;
    }

    public getWalkSpeed(): number {
        return this.walkSpeed;
    }

    // Method to handle manual velocity setting (for compatibility with existing input system)
    public setManualVelocity(
        vx: number,
        vy: number,
        direction?: "down" | "left" | "up" | "right"
    ): void {
        this.vx = vx;
        this.vy = vy;

        if (direction) {
            this.lastDirection = direction;
        }

        this.updateMovementState();
    }

    // Method to reset velocities (called at the start of each update cycle)
    public resetVelocities(): void {
        this.vx = 0;
        this.vy = 0;
    }

    public movePlayer(x: number, y: number): void {
        // Stop any existing tween on this player
        this.scene.tweens.killTweensOf(this);

        // Calculate the direction of movement to set the correct animation
        const dx = x - this.x;
        const dy = y - this.y;
        let direction: "up" | "down" | "left" | "right" = "down";

        if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? "right" : "left";
        } else {
            direction = dy >= 0 ? "down" : "up";
        }

        // Play the walk animation if the player is moving
        if (dx !== 0 || dy !== 0) {
            this.play("walk_" + direction, true);
        } else {
            this.play("idle_" + direction, true);
        }

        // Tween the player to the new position
        this.scene.tweens.add({
            targets: this,
            x: x,
            y: y,
            ease: 'Linear',
            duration: 1000 / 12, // Matches the server's update rate
            onComplete: () => {
                // Return to idle animation when the tween is complete and they are not moving
                if (dx === 0 && dy === 0) {
                    this.lastDirection = direction;
                    this.play("idle_" + this.lastDirection, true);
                }
            }
        });
    }
}
