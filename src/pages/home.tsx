import { useEffect, useRef, useState } from "react";
// import React from "react";
import { IRefPhaserGame, PhaserGame } from "../game/PhaserGame";
import { Game } from "../game/scenes/Game";
import { MainMenu } from "../game/scenes/MainMenu";
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
    let T: number;

    ws.onopen = (e) => {
      const players = new Map<
        number,
        Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
      >();

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.position) {
          const playerData = players.get(data.id);
        if (playerData) {
            playerData.sprite.setPosition(data.position.x, data.position.y); // Update sprite position
            playerData.playerNameText.setPosition(data.position.x, data.position.y - 50); // Update name position
        }
        } else if (data.id) {
          T = setInterval(() => {
            ws.send(JSON.stringify({ id: data.id,name: "user", position: { x: scene.player.x, y: scene.player.y } }));
          }, 1000 / 24);
        } else if (data.connection) {
          // const playerSprite = scene.physics.add.sprite(400,300,"dude");
          const player = scene.physics.add.sprite(400, 300, "dude");
          player.setBounce(0.2);
          console.log("data is ",data);
          const playerNameText = scene.add.text(400, 250, data.playerNameText || 'usser', {
            // fontSize: "16px",
            // color: "#ffffff",
            // fontStyle: "bold",
            // backgroundColor: "#000000",
            padding: { left: 4, right: 4, top: 2, bottom: 2 },
        }).setOrigin(0.5);

          players.set(data.connection, {sprite:player,playerNameText});
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
