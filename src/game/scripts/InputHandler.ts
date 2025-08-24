import { Scene } from "phaser";
import { Player } from "./Player";

export interface InputConfig {
  enableWASD?: boolean;
  enableArrowKeys?: boolean;
  enableTouch?: boolean;
  enableGamepad?: boolean;
}

export class InputHandler {
  private scene: Scene;
  private player: Player;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private config: InputConfig;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private minSwipeDistance: number = 50;
  private gamepad: Phaser.Input.Gamepad.Gamepad | null = null;

  constructor(scene: Scene, player: Player, config: InputConfig = {}) {
    this.scene = scene;
    this.player = player;
    this.config = {
      enableWASD: true,
      enableArrowKeys: true,
      enableTouch: false,
      enableGamepad: false,
      ...config,
    };

    this.setupKeyboardInput();
    this.setupTouchInput();
    this.setupGamepadInput();
  }

  private setupKeyboardInput(): void {
    if (!this.scene.input.keyboard) return;

    // Arrow keys
    if (this.config.enableArrowKeys) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
    }

    // WASD keys
    if (this.config.enableWASD) {
      this.wasdKeys = this.scene.input.keyboard.addKeys("W,S,A,D") as {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
      };
    }
  }

  private setupTouchInput(): void {
    if (!this.config.enableTouch) return;

    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
    });

    this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      const deltaX = pointer.x - this.touchStartX;
      const deltaY = pointer.y - this.touchStartY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > this.minSwipeDistance) {
        this.handleSwipe(deltaX, deltaY);
      }
    });
  }

  private setupGamepadInput(): void {
    if (!this.config.enableGamepad) return;

    this.scene.input.gamepad?.on(
      "connected",
      (gamepad: Phaser.Input.Gamepad.Gamepad) => {
        this.gamepad = gamepad;
        console.log("Gamepad connected:", gamepad.id);
      }
    );

    this.scene.input.gamepad?.on("disconnected", () => {
      this.gamepad = null;
      console.log("Gamepad disconnected");
    });
  }

  private handleSwipe(deltaX: number, deltaY: number): void {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Reset velocities first
    this.player.resetVelocities();

    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        this.player.moveRight();
      } else {
        this.player.moveLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        this.player.moveDown();
      } else {
        this.player.moveUp();
      }
    }
  }

  public update(): void {
    // Reset velocities at the start of each frame
    this.player.resetVelocities();

    this.handleKeyboardInput();
    this.handleGamepadInput();
  }

  private handleKeyboardInput(): void {
    let vx = 0;
    let vy = 0;
    let direction: "down" | "left" | "up" | "right" =
      this.player.getLastDirection();

    // Handle vertical movement
    if (this.isUpPressed()) {
      vy = -this.player.getSpeed();
      direction = "up";
    } else if (this.isDownPressed()) {
      vy = this.player.getSpeed();
      direction = "down";
    }

    // Handle horizontal movement
    if (this.isLeftPressed()) {
      vx = -this.player.getSpeed();
      direction = "left";
    } else if (this.isRightPressed()) {
      vx = this.player.getSpeed();
      direction = "right";
    }

    // Set the manual velocity (this handles normalization and animation)
    this.player.setManualVelocity(vx, vy, direction);
  }

  private handleGamepadInput(): void {
    if (!this.gamepad) return;

    const leftStick = this.gamepad.leftStick;
    const threshold = 0.3; // Dead zone threshold

    let vx = 0;
    let vy = 0;
    let direction: "down" | "left" | "up" | "right" =
      this.player.getLastDirection();

    // Handle analog stick input
    if (Math.abs(leftStick.x) > threshold) {
      vx = leftStick.x * this.player.getSpeed();
      direction = leftStick.x > 0 ? "right" : "left";
    }

    if (Math.abs(leftStick.y) > threshold) {
      vy = leftStick.y * this.player.getSpeed();
      direction = leftStick.y > 0 ? "down" : "up";
    }

    // Handle D-pad input
    if (this.gamepad.left) {
      vx = -this.player.getSpeed();
      direction = "left";
    } else if (this.gamepad.right) {
      vx = this.player.getSpeed();
      direction = "right";
    }

    if (this.gamepad.up) {
      vy = -this.player.getSpeed();
      direction = "up";
    } else if (this.gamepad.down) {
      vy = this.player.getSpeed();
      direction = "down";
    }

    // Set the manual velocity
    this.player.setManualVelocity(vx, vy, direction);
  }

  private isUpPressed(): boolean {
    return (
      (this.config.enableArrowKeys && this.cursors?.up.isDown) ||
      (this.config.enableWASD && this.wasdKeys?.W.isDown)
    );
  }

  private isDownPressed(): boolean {
    return (
      (this.config.enableArrowKeys && this.cursors?.down.isDown) ||
      (this.config.enableWASD && this.wasdKeys?.S.isDown)
    );
  }

  private isLeftPressed(): boolean {
    return (
      (this.config.enableArrowKeys && this.cursors?.left.isDown) ||
      (this.config.enableWASD && this.wasdKeys?.A.isDown)
    );
  }

  private isRightPressed(): boolean {
    return (
      (this.config.enableArrowKeys && this.cursors?.right.isDown) ||
      (this.config.enableWASD && this.wasdKeys?.D.isDown)
    );
  }

  public destroy(): void {
    // Clean up event listeners
    if (this.config.enableTouch) {
      this.scene.input.off("pointerdown");
      this.scene.input.off("pointerup");
    }

    if (this.config.enableGamepad && this.scene.input.gamepad) {
      this.scene.input.gamepad.off("connected");
      this.scene.input.gamepad.off("disconnected");
    }
  }

  // Utility methods for other systems to check input state
  public isAnyMovementPressed(): boolean {
    return (
      this.isUpPressed() ||
      this.isDownPressed() ||
      this.isLeftPressed() ||
      this.isRightPressed()
    );
  }

  public getCurrentInputDirection(): "down" | "left" | "up" | "right" | null {
    if (this.isUpPressed()) return "up";
    if (this.isDownPressed()) return "down";
    if (this.isLeftPressed()) return "left";
    if (this.isRightPressed()) return "right";
    return null;
  }

  // Method to get current velocities (useful for debugging or other systems)
  public getCurrentVelocities(): { vx: number; vy: number } {
    return {
      vx: this.player.getVelocityX(),
      vy: this.player.getVelocityY(),
    };
  }
}
