import userContext from "@/context/User";
import { IRefPhaserGame, PhaserGame } from "@/game/PhaserGame";
import React, { useContext, useRef } from "react";

const GamePage = () => {
  const session = useContext(userContext);
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  const currentScene = (scene: Phaser.Scene) => {
    if (scene.scene.key === "Game") {
      const GameScene = phaserRef.current?.scene;
    }
  };

  return (
    <div>
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
    </div>
  );
};

export default GamePage;
