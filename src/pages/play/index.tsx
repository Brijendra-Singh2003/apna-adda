import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "../../game/PhaserGame";
import { Game } from "../../game/scenes/Game";
import { MainMenu } from "../../game/scenes/MainMenu";
import Player from "../../game/prefabs/Player";
import ChatSection, { Message } from "../../components/ChatSection";
import CallSection from "../../components/CallSection";
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const socketUrl = import.meta.env.VITE_SOCKET_URL;
// type MessageType = {
//   id: number;
//   text: string;
//   sender: "agent" | "user";
// };
type PlayerType = {
  username: string;
  posi: {
    x: number;
    y: number;
    vx: number;
    vy: number;
  };
  messages: Message[];
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
  // const [userName, setUserName] = useState("");
  const [isOpenText, setIsOpenText] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomID, setRoomId] = useState("");
  const [notify, SetNotify] = useState(false);
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  console.log("parent rerenderion.....");

  const onMessage = (text: string) => {
    if (WS?.readyState !== WS?.CLOSED) {
      WS?.send(
        JSON.stringify({
          type: "messages",
          data: { text, room: roomID },
        })
      );
    }
  };

  const handlePlayerEnter = (a: string) => {
    console.log("function call hua hai", a);
    setRoomId(a);
    setIsOpenText(true);

    console.log("sss", WS?.readyState !== WS?.CLOSED);
    WS?.send(
      JSON.stringify({
        type: "enter",
        data: { room: a },
      })
    );
  };

  const handlePlayerExit = () => {
    setIsOpenText(false);
    if (WS?.readyState !== WS?.CLOSED) {
      WS?.send(
        JSON.stringify({
          type: "exit",
          data: { room: roomID },
        })
      );
    }
  };

  const changeScene = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene as MainMenu;

      if (scene) {
        scene.changeScene();
      }
    }
  };

  Game.onPlayerEnterZone = handlePlayerEnter; // Assign the callback
  Game.onPlayerExitZone = handlePlayerExit;
  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    setCanMoveSprite(scene.scene.key === "Game");

    if (scene.scene.key === "Game") {
      const GameScene = phaserRef.current?.scene as Game;
      if (GameScene) {
        setTimeout(() => {
          console.log("ab hoga na");
          if (!Game.onPlayerEnterZone) {
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
    window.open(`${backendUrl}/logOut`, "_self");
  };

  const handleGoogleLogin = () => {
    window.open(`${backendUrl}/auth/google`, "_self");
  };

  useEffect(() => {
    console.log({ canMoveSprite });
    // setUserName('JohnDoe');
    const fetchSession = async () => {
      const result = await axios.get(
        `${backendUrl}/auth/check-session`,
        {
        withCredentials: true,
        }
      );
      console.log("the user data is ", result.data);
      if (result.data) {
        setUser(result.data);
        // setUserName(result.data.user.name);
      }
    };

    fetchSession();

    if (!canMoveSprite || !phaserRef.current?.scene) return;

    WS?.close();
    const scene = phaserRef.current.scene as Game;
    const ws = new WebSocket(socketUrl);
    const myUsername = user?.user?.name;
    // let closed: boolean = true;
    // let prevTick = Date.now();

    ws.onopen = () => {
      const players = new Map<string, Player>();
      // closed = false;
      console.log(roomID);
      ws.send(
        JSON.stringify({
          type: "init",
          data: { username: user?.user?.name, room: roomID },
        })
      );

      ws.onmessage = (e) => {
        const message = JSON.parse(e.data);
        // console.log("uper",data);

        switch (message.type) {
          case "update": {
            message.data.forEach((e: PlayerType) => {
              if (e.username === myUsername) {
                return;
              }

              if (!players.has(e.username)) {
                const newPlayer = new Player(
                  scene,
                  e.posi.x,
                  e.posi.y,
                  "player",
                  e.username
                );
                // setMessages([...messages,...e.messages]);
                players.set(e.username, newPlayer);
              }

              players.get(e.username)?.setSpeed(e.posi.vx, e.posi.vy);
              players.get(e.username)?.setPosition(e.posi.x, e.posi.y);
            });
            break;
          }
          case "messages": {
            const data = message.data;
            console.log("got messages", data);
            setMessages(data);
            console.log(message.notify);
            SetNotify(true);
            break;
          }
          case "leave": {
            const player = players.get(message.data.username);
            player?.destroy();
            players.delete(message.data.username);
            break;
          }
        }
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
        // closed = true;
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
          Change Scene ${roomID}
        </button>

        {isOpenText && roomID && <CallSection socket={WS} RoomId={roomID} />}
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
      {isOpenText && user?.user.name && (
        <ChatSection
          messages={messages}
          onMessage={onMessage}
          userName={user.user.name}
          notify={notify}
        />
      )}
      {user?.user.name ? (
        <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
      ) : (
        <h1>Please login to continue</h1>
      )}
    </div>
  );
}

export default HomePage;
