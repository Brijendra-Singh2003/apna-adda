import userContext from "@/context/User";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";
import { Demo } from "@/game/scenes/Demo";
import GameManager from "@/game/scripts/GameManager";
import { SOCKET_URL } from "@/lib/constants";
import { useContext, useEffect, useRef, useState } from "react";
import Notfound from "../Notfound";
import { useParams } from "react-router-dom";
import ChatSection2 from "@/components/ChatSection2";

const GamePage = () => {
  const session = useContext(userContext);
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [canChat, setCanChat] = useState(false);
  const [scene, setScene] = useState<Demo | null>(null);
  const { worldId } = useParams<{ worldId: string }>();

  useEffect(() => {
    if (!session.user?._id || !scene || !worldId) return;

    const user = session.user;
    const searchParams = new URLSearchParams({
      id: user._id,
      name: user.name,
    });

    const ws = new WebSocket(`${SOCKET_URL}/${worldId}?${searchParams}`);
    ws.onopen = () => {
      const eventBus = new Phaser.Events.EventEmitter();
      const gameManager = new GameManager(ws, eventBus, scene, user);

      ws.onmessage = (message) => {
        const { type, data } = JSON.parse(message.data);
        eventBus.emit(type, data);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key == "e" || e.key == "E") {
          setCanChat(true);
          gameManager.enterRoom("1");
        }

        if (e.key == "l" || e.key == "L") {
          setCanChat(false);
          gameManager.exitRoom();
        }
      };

      ws.onclose = () => {
        gameManager.destroy();
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
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

  if (!session.user?._id || !worldId) {
    return <Notfound />;
  }

  return (
    <div>
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
      {canChat && GameManager.instance && (
        <ChatSection2
          userName={session.user.name}
          gameManager={GameManager.instance}
        />
      )}
    </div>
  );
};

export default GamePage;
