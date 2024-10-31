import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "../game/PhaserGame";
import { Game } from "../game/scenes/Game";
import { MainMenu } from "../game/scenes/MainMenu";
import Player from "../game/prefabs/Player";

function HomePage() {
  const [canMoveSprite, setCanMoveSprite] = useState(false);
  const [WS, setWs] = useState<WebSocket>();
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  const changeScene = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene as MainMenu;

      if (scene) {
        scene.changeScene();
      }
    }
  };

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    setCanMoveSprite(scene.scene.key === "Game");
  };

  useEffect(() => {
    console.log({ canMoveSprite });
    if (!canMoveSprite || !phaserRef.current?.scene) return;

    WS?.close();
    const scene = phaserRef.current.scene as Game;
    const ws = new WebSocket("ws://172.17.5.178:3000");
    let closed: boolean;
    let prevTick: number = Date.now();

    ws.onopen = (e) => {
      const players = new Map<number, Player>();
      closed = false;

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.posi) {
          const player = players.get(data.id);
          if (!player) return;

          const vx = data.posi.vx;
          const vy = data.posi.vy;

          if (vx < -40) player.anims.play("left", true);
          else if (vx > 40) player.anims.play("right", true);
          else player.anims.play("turn", true);

          player.setPosition(data.posi.x, data.posi.y);
          player.setVelocity(vx, vy);
        } else if (data.id) {
          const Update = () => {
            if(closed) return;

            const currTick = Date.now();

            if(currTick - prevTick > 1000/16) {
              ws.send(
                JSON.stringify({
                  id: data.id,
                  posi: {
                    x: Math.floor(scene.player?.x ?? 0),
                    y: Math.floor(scene.player?.y ?? 0),
                    vx: scene.vx,
                    vy: scene.vy,
                  },
                })
              );

              prevTick = currTick;
            }

            requestAnimationFrame(Update);
          };

          requestAnimationFrame(Update);
        } else if (data.connection) {
          if (players.has(data.connection)) return;
          const player = new Player(scene, 400, 300, "dude", data.connection.toString());
          player.setBounce(0.2);
          scene.physics.add.collider(player, scene.tables!);

          players.set(data.connection, player);
        } else if (data.close) {
          const player = players.get(data.close);
          player?.destroy();
          players.delete(data.close);
        }
      };

      ws.onclose = () => {
        players.forEach((player) => player.destroy());
        closed = true;
      };
    };

    setWs(ws);

    return () => {
      ws.close();
    };
  }, [canMoveSprite]);

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
      <button onClick={changeScene}>Change Scene</button>
    </div>
  );
}

export default HomePage;
