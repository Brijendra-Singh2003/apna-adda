import Phaser from "phaser";
import { Player } from "./Player";
import { Demo } from "../scenes/Demo";

interface IPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
}

class GameManager extends Phaser.GameObjects.GameObject {
  public scene: Demo;
  private ws: WebSocket;
  private updateInterval: NodeJS.Timeout;
  private player: Player;
  private me: User;
  private roomId?: string | null;
  public onChatMessage?: (senderName: string, text: string) => void;
  public static instance?: GameManager;

  constructor(
    ws: WebSocket,
    eventBus: Phaser.Events.EventEmitter,
    scene: Demo,
    me: User
  ) {
    super(scene, "GameManager");

    this.ws = ws;
    this.me = me;
    this.scene = scene;
    this.player = scene.player;

    eventBus.on("playerUpdates", this.onPlayerUpdates.bind(this));
    eventBus.on("disconnect", this.onPlayerDisconnect.bind(this));
    eventBus.on("chatMessage", this.handleChatMessageReceive.bind(this));

    this.updateInterval = setInterval(() => this.broadcastUpdates(), 1000 / 12);
    GameManager.instance = this;
  }

  private onPlayerUpdates(players: IPlayer[]) {
    players.forEach((player) => {
      if (player.id === this.me._id) return;

      if (!this.scene.getRemotePlayer(player.id)) {
        this.scene.addRemotePlayer(player.id, player.name, player.x, player.y);
      }

      this.scene.getRemotePlayer(player.id).movePlayer(player.x, player.y);
    });
  }

  private onPlayerDisconnect(playerId: string) {
    this.scene.removeRemotePlayer(playerId);
  }

  private broadcastUpdates() {
    this.ws.send(
      JSON.stringify({
        type: "playerMovement",
        data: {
          x: this.player.x,
          y: this.player.y,
        },
      })
    );
  }

  //   // for handling enter and exit of room
  //   public handleEnterandExit(key: string) {
  //     if (key == "E" || key == "e") {
  //       this.ws.send(
  //         JSON.stringify({ type: "enterRoom", data: { roomId: "1" } })
  //       );
  //     }
  //     if (key == "L" || key == "l") {
  //       this.ws.send(JSON.stringify({ type: "exitRoom", data: { roomId: "1" } }));
  //     }
  //   }

  // Room and Chat handlers
  public enterRoom(roomId: string = "1") {
    this.ws.send(
      JSON.stringify({
        type: "enterRoom",
        data: { roomId },
      })
    );

    this.roomId = roomId;
  }

  public sendChatMessage(text: string) {
    if (!this.roomId) {
      console.error("Not in any room.");
      return;
    }

    this.ws.send(
      JSON.stringify({
        type: "messageInRoom",
        data: {
          roomId: this.roomId,
          text,
        },
      })
    );
  }

  private handleChatMessageReceive(data: { userName: string; text: string }) {
    console.log(data);
    if (this.onChatMessage) {
      this.onChatMessage(data.userName, data.text);
    }
  }

  public exitRoom() {
    this.ws.send(
      JSON.stringify({
        type: "exitRoom",
        data: {
          roomId: this.roomId,
        },
      })
    );

    this.roomId = null;
  }

  public destroy() {
    clearInterval(this.updateInterval);
  }
}

export default GameManager;
