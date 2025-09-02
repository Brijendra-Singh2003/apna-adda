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

    constructor(ws: WebSocket, eventBus: Phaser.Events.EventEmitter, scene: Demo, me: User) {
        super(scene, "GameManager");

        this.ws = ws;
        this.me = me;
        this.scene = scene;
        this.player = scene.player;

        eventBus.on("playerUpdates", this.onPlayerUpdates.bind(this));
        eventBus.on("disconnect", this.onPlayerDisconnect.bind(this));

        this.updateInterval = setInterval(() => this.broadcastUpdates(), 1000 / 12);
    }

    private onPlayerUpdates(players: IPlayer[]) {
        players.forEach(player => {
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
        this.ws.send(JSON.stringify({
            type: "playerMovement",
            data: {
                x: this.player.x,
                y: this.player.y,
            }
        }));
    }

    public destroy() {
        clearInterval(this.updateInterval);
    }
}

export default GameManager;