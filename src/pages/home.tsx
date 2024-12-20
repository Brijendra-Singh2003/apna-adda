import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "../game/PhaserGame";
import { Game } from "../game/scenes/Game";
import { MainMenu } from "../game/scenes/MainMenu";
import Player from "../game/prefabs/Player";
import ChatSection from "../components/ChatSection";
import axios from "axios";

type PlayerType = {
  username: string;
  posi: {
    x: number;
    y: number;
    vx: number;
    vy: number;
  };
};

type User = {
  user: {
    name: string;
    email: string;
  };
};

function HomePage() {
  const [WS, setWs] = useState<WebSocket>();
  const [canMoveSprite, setCanMoveSprite] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [isOpenText, setIsOpenText] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: "agent" },
    { id: 2, text: "I have a question about my order", sender: "user" },
    {
      id: 3,
      text: "Sure, I'd be happy to help. What's your order number?",
      sender: "agent",
    },
  ]);
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const fun = () => {
    console.log("function call hua hai");
    setIsOpenText(true);
  };
  const fun2 = () => {
    setIsOpenText(false);
  };
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

    Game.onPlayerExitZone = fun2;

    if (scene.scene.key === "Game") {
      const GameScene = phaserRef.current?.scene as Game;
      if (GameScene) {
        setTimeout(() => {
          console.log("ab hoga na");
          if (!Game.onPlayerEnterZone) {
            Game.onPlayerEnterZone = fun; // Assign the callback
            console.log("assiign hogays");
            // fun();
          } else {
            console.log("Callback already assigned");
          }
        }, 100);
      }
    }
  };

  const handleGoogleLogOut = () => {
    window.open("http://localhost:3000/logOut", "_self");
  };

  const handleGoogleLogin = () => {
    window.open("http://localhost:3000/auth/google", "_self");
  };

  useEffect(() => {
    console.log({ canMoveSprite });
    // setUserName('JohnDoe');
    const fetchSession = async () => {
      const result = await axios.get("http://localhost:3000/check-session", {
        withCredentials: true,
      });
      console.log("the user data is ", result.data);
      if (result.data) {
        setUser(result.data);
        setUserName(result.data.user.name);
      }
    };

    fetchSession();

    if (!canMoveSprite || !phaserRef.current?.scene) return;

    WS?.close();
    const scene = phaserRef.current.scene as Game;
    const ws = new WebSocket("ws://localhost:3000");
    const myUsername = user?.user?.name;
    let closed: boolean = true;
    let prevTick = Date.now();

    ws.onopen = (e) => {
      const players = new Map<string, Player>();
      closed = false;
      ws.send(
        JSON.stringify({ type: "init", data: { username: user?.user?.name } })
      );

      ws.onmessage = (e) => {
        const messege = JSON.parse(e.data);
        // console.log("uper",data);

        switch (messege.type) {
          case "update": {
            messege.data.forEach((e: PlayerType) => {
              if (e.username === myUsername) {
                return;
              }
              console.log("user", e.username, "has", players.has(e.username));
              if (!players.has(e.username)) {
                const newPlayer = new Player(
                  scene,
                  e.posi.x,
                  e.posi.y,
                  "player",
                  e.username
                );
                players.set(e.username, newPlayer);
              }
              players.get(e.username)?.setSpeed(e.posi.vx, e.posi.vy);
              players.get(e.username)?.setPosition(e.posi.x, e.posi.y);
            });
          }
        }

        // if (messege.posi) {
        //   const player = players.get(messege.id);
        //   if (!player) return;
        //   player.setPosition(messege.posi.x, messege.posi.y);
        //   player.setSpeed(messege.posi.vx, messege.posi.vy);
        // } else if (messege.id) {
        //   const Update = () => {
        //     if(closed) return;

        //     const currTick = Date.now();

        //     if(currTick - prevTick > 1000/16) {
        //       ws.send(
        //         JSON.stringify({
        //           id: messege.id,
        //           posi: {
        //             x: Math.floor(scene.player?.x ?? 0),
        //             y: Math.floor(scene.player?.y ?? 0),
        //             vx: scene.vx,
        //             vy: scene.vy,
        //           },
        //         })
        //       );

        //       prevTick = currTick;
        //     }

        //     requestAnimationFrame(Update);
        //   };

        //   requestAnimationFrame(Update);
        // } else if (messege.connection) {
        //   if (players.has(messege.connection)) return;
        //   console.log("data is ",messege);
        //   const player = new Player(scene, 400, 300, "dude", messege.name || user?.user?.name);
        //   player.setBounce(0.2);
        //   scene.physics.add.collider(player, scene.tables!);

        //   players.set(messege.connection, player);
        // } else if (messege.close) {
        //   const player = players.get(messege.close);
        //   player?.destroy();
        //   players.delete(messege.close);
        // }
      };
      const id = setInterval(() => {
        ws.send(
          JSON.stringify({
            type: "move",
            data: {
              posi: {
                x: Math.floor(scene.player?.x ?? 0),
                y: Math.floor(scene.player?.y ?? 0),
                vx: scene.vx,
                vy: scene.vy,
              },
            },
          })
        );
      }, 100);

      ws.onclose = () => {
        players.forEach((player) => player.destroy());
        closed = true;
        clearInterval(id);
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
        <button onClick={changeScene} className="bg-slate-50 text-black w-1/2">
          Change Scene
        </button>

        {user ? (
          <button
            onClick={handleGoogleLogOut}
            className="bg-slate-50 text-black w-1/2 hover:bg-black hover:text-slate-50"
          >
            Log Out, MR. {user?.user?.name}
          </button>
        ) : (
          <button
            onClick={handleGoogleLogin}
            className="bg-slate-50 text-black w-1/2 hover:bg-black hover:text-slate-50"
          >
            Sign In with Google
          </button>
        )}
      </div>
      {isOpenText && (
        <ChatSection messages={messages} setMessages={setMessages} />
      )}
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
    </div>
  );
}

export default HomePage;
