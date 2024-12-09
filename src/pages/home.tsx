import { useEffect, useRef, useState } from "react";
// import React from "react";
import { IRefPhaserGame, PhaserGame } from "../game/PhaserGame";
import { Game } from "../game/scenes/Game";
import { MainMenu } from "../game/scenes/MainMenu";
import Player from "../game/prefabs/Player";
// import { Navigate } from "../../node_modules/react-router-dom/dist/index";
import { useNavigate } from 'react-router-dom';
// import { useAuth0 } from "@auth0/auth0-react";
import { use } from "matter";
import axios from "axios";
function HomePage() {
  const [canMoveSprite, setCanMoveSprite] = useState(false);
  const [WS, setWs] = useState<WebSocket>();
  // const {user, isAuthenticated} = useAuth0();
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const navigate = useNavigate();
  const [user,setUser] = useState(null);
  const [name,setName] = useState();
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

  const handleGoogleLogOut= () => {
    window.open("http://localhost:3000/logOut", "_self");
  };

  const handleGoogleLogin = () => {
    window.open("http://localhost:3000/auth/google", "_self");
  };

  useEffect(() => {
    console.log({ canMoveSprite });
    
    const fetchSession = async()=>{
      const result = await axios.get("http://localhost:3000/check-session",{withCredentials:true});
      console.log("the user data is ",result.data);
      if(result.data){
        setUser(result.data);
      }
    }

    fetchSession();
    if (!canMoveSprite || !phaserRef.current?.scene) return;
    WS?.close();
    const scene = phaserRef.current.scene as Game;
    const ws = new WebSocket("ws://192.168.204.1:3000");
    let closed: boolean = true;
    let prevTick = Date.now();

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
          const player = new Player(scene, 400, 300, "dude", data.playerNameText || 'usser');
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
    <div id="app" className="">
      <div className="flex gap-6  text-black w-full">
      <button onClick={changeScene} className="bg-slate-50 text-black w-1/2">Change Scene</button>
      
      {user ? (
          <button onClick={handleGoogleLogOut} className="bg-slate-50 text-black w-1/2 hover:bg-black hover:text-slate-50">Log Out, MR. {user?.user?.name}</button>
        ) : (
          <button onClick={handleGoogleLogin} className="bg-slate-50 text-black w-1/2 hover:bg-black hover:text-slate-50">Sign In with Google</button>
        )}

      </div>
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

    </div>
  );
}

export default HomePage;
