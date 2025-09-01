import userContext from "@/context/User";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";
import { useContext, useEffect, useRef } from "react";

const GamePage = () => {
  const session = useContext(userContext);
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  useEffect(() => {
    console.log(phaserRef.current);
  }, [phaserRef.current]);

  const currentScene = (scene: Phaser.Scene) => {
    if (scene.scene.key === "Game") {
      const GameScene = phaserRef.current?.scene;
      console.log({ GameScene });
    }
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
