import { useEffect, useState, useRef } from "react";
import VideoComponent from "./VideoComponent";

const iceServers = [
  {
    urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
  },
];
const iceCandidatePoolSize = 10;

export default function CallSection({ socket }: { socket: WebSocket }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const hasJoined = useRef(false); // To prevent sending multiple "join" messages
  const peerConnections = useRef(new Map<string, RTCPeerConnection>()); // Use ref for stable reference

  const [videoEle, setVideoEle] = useState<
    {
      id: string;
      srcObject: MediaStream;
    }[]
  >([]);

  const createPc = (remoteId: string) => {
    if (!localStream) {
      console.warn("Local stream is not yet available!");
      return null;
    }

    const pc = new RTCPeerConnection({
      iceCandidatePoolSize,
      iceServers,
    });

    // Add tracks from localStream to the peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Store the peer connection
    peerConnections.current.set(remoteId, pc);

    return pc;
  };

  const handleSocketMessages = async (event: MessageEvent) => {
    try {
      let pc;
      let video;
      let mediaStream: MediaStream;
      let senderId: string;
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "clients":
          console.log("Connected clients: ", message.data);
          const clients = message.data;
          for (const client of clients) {
            pc = createPc(client);
            if (!pc) return; // Skip if localStream is not available

            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);

            socket.send(
              JSON.stringify({
                type: "offer",
                receiverId: client,
                data: offerDescription,
              })
            );
          }
          break;

        case "offer":
          console.log("Received offer: ", message);
          senderId = message.senderId;
          if (peerConnections.current.has(senderId)) return;
          pc = createPc(senderId);
          if (!pc) return;

          // video = createNewVideoElement(senderId);
          mediaStream = new MediaStream();
          pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
              mediaStream.addTrack(track);
            });
          };

          console.log("video onj before changeing ", {
            id: senderId,
            srcObject: mediaStream,
          });
          setVideoEle((prev) => [
            ...prev,
            { id: senderId, srcObject: mediaStream },
          ]);

          await pc.setRemoteDescription(
            new RTCSessionDescription(message.data)
          );

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.send(
            JSON.stringify({
              type: "answer",
              data: answer,
              receiverId: senderId,
            })
          );

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.send(
                JSON.stringify({
                  type: "candidate",
                  data: event.candidate.toJSON(),
                  receiverId: senderId,
                })
              );
            }
          };
          break;

        case "answer":
          console.log("Received answer: ", message);
          senderId = message.senderId;
          pc = peerConnections.current.get(senderId);
          if (!pc) return;

          // Ensure that the peer connection is expecting an answer
          if (pc.signalingState !== "have-local-offer") {
            console.warn(
              "Ignoring answer because signalingState is",
              pc.signalingState
            );
            return;
          }
          pc.setRemoteDescription(new RTCSessionDescription(message.data)).then(
            () => console.log("remote description is set")
          );

          mediaStream = new MediaStream();

          console.log("after getting ans and push into video Ele", videoEle);
          pc.ontrack = (e) => {
            e.streams[0].getTracks().forEach((track) => {
              mediaStream.addTrack(track);
            });
          };
          console.log("video onj before changeing ", {
            id: senderId,
            srcObject: mediaStream,
          });
          setVideoEle((prev) => [
            ...prev,
            { id: senderId, srcObject: mediaStream },
          ]);

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.send(
                JSON.stringify({
                  type: "candidate",
                  data: event.candidate.toJSON(),
                  receiverId: senderId,
                })
              );
            }
          };
          break;

        case "candidate":
          // console.log("Received candidate: ", message);
          pc = peerConnections.current.get(message.senderId);
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(message.data));
          } else {
            console.log("nnnnnnnnnnnnnaaaaaaaaaaaaaaaaaaaaaa");
          }
          break;

        case "exitRoom":
          if (peerConnections.current.has(message.data)) {
            const pc = peerConnections.current.get(message.data); // data is sender id (not by chatgpt)
            pc?.close();
            peerConnections.current.delete(message.data);
          }
          setVideoEle((prev) => prev.filter((e) => e.id !== message.data));

          break;

        default:
          console.warn("Unknown message type: ", message.type);
      }
    } catch (error) {
      console.error("Error handling socket message: ", error);
    }
  };

  useEffect(() => {
    const myVideo = document.getElementById("my-video") as HTMLVideoElement;

    const accessWebcam = async () => {
      try {
        const res = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Local stream initialized:", res);
        myVideo.srcObject = res;
        setLocalStream(res); // Set the local stream after fetching it
      } catch (err) {
        console.error("Error accessing media devices: ", err);
      }
    };

    accessWebcam();

    return () => {
      // Cleanup: Remove socket event listener and stop tracks
      peerConnections.current.forEach((pc, key) => {
        pc.close();
        peerConnections.current.delete(key);
      });

      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [socket]);

  useEffect(() => {
    if (!localStream) return;

    if (!hasJoined.current && socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "join",
        })
      );
      hasJoined.current = true;
    }
    socket.addEventListener("message", handleSocketMessages);

    return () => {
      socket.removeEventListener("message", handleSocketMessages);
    };
  }, [localStream]);

  return (
    <div
      id="video"
      className="bg-gray-500 fixed top-16 left-36 flex flex-wrap gap-8"
    > 
      <video
        id="my-video"
        className="h-28 object-cover aspect-video"
        autoPlay
        playsInline
        muted
      ></video>
      {/* {videoEle.map((val) => {
        return (
          <video
            key={val.id}
            id={val.id}
            className="h-28 object-cover aspect-video"
            autoPlay
            playsInline
            muted
            srcobject={val.mediaStream}
          >
            12
          </video>
        );
      })} */}
      {videoEle.map((val) => (
        <VideoComponent key={val.id} videoObj={val} />
      ))}
    </div>
  );
}
