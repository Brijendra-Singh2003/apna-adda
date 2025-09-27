import userContext from "@/context/User";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";
import { useContext, useRef } from "react";

const GamePage = () => {
  const session = useContext(userContext);
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  const currentScene = (scene: Phaser.Scene) => {
    console.log({ currentScene: scene.scene.key });
  };

  if (session.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
    </div>
  );
};

export default GamePage;
