import userContext from "@/context/User";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";
import { Demo } from "@/game/scenes/Demo";
import GameManager from "@/game/scripts/GameManager";
import { SOCKET_URL } from "@/lib/constants";
import { useContext, useEffect, useRef, useState } from "react";
import Notfound from "../Notfound";
import { useParams } from "react-router-dom";

const GamePage = () => {
  const session = useContext(userContext);
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [scene, setScene] = useState<Demo | null>(null);
  const { roomId } = useParams<{ roomId: string }>();

  useEffect(() => {
    if (!session.user?._id || !scene || !roomId) return;

    const user = session.user;
    const searchParams = new URLSearchParams({
      id: user._id,
      name: user.name,
    });

    const ws = new WebSocket(`${SOCKET_URL}/${roomId}?${searchParams}`);

    ws.onopen = () => {
      const eventBus = new Phaser.Events.EventEmitter();
      const gameManager = new GameManager(ws, eventBus, scene, user);

      ws.onmessage = (message) => {
        const { type, data } = JSON.parse(message.data);
        eventBus.emit(type, data);
      };

      ws.onclose = () => {
        gameManager.destroy();
      };
    };

    return () => {
      ws.close();
    };
  }, [session.user, scene]);

  const currentScene = (scene: Phaser.Scene) => {
    if (scene.scene.key === "Demo") {
      setScene(scene as Demo);
    } else {
      setScene(null);
    }
  };

  if (session.isLoading) {
    return <div>Loading...</div>;
  }

  if (!session.user?._id || !roomId) {
    return <Notfound />;
  }

  return (
    <div>
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
    </div>
  );
};

export default GamePage;
