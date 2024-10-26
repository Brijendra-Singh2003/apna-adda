import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "../game/PhaserGame";
import { Game } from "../game/scenes/Game";
import { MainMenu } from "../game/scenes/MainMenu";

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
    const ws = new WebSocket("ws://172.17.4.129:3000");
    let T: number;

    ws.onopen = (e) => {
      const players = new Map<
        number,
        Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      >();

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.position) {
          players.get(data.id)?.setPosition(data.position.x, data.position.y);
        } else if (data.id) {
          T = setInterval(() => {
            ws.send(JSON.stringify({ id: data.id, position: { x: scene.player.x, y: scene.player.y } }));
          }, 1000 / 24);
        } else if (data.connection) {
          const player = scene.physics.add.sprite(400, 300, "dude");
          player.setBounce(0.2);

          players.set(data.connection, player);
        } else if (data.close) {
          const player = players.get(data.close);
          player?.destroy();
          players.delete(data.close);
        }
      };
    };

    setWs(ws);

    return () => {
      ws.close();
      clearInterval(T);
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
