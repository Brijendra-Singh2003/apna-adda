import React, { useEffect, useRef } from "react";

export default function VideoComponent({ videoObj }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    console.log("vide obj is ", videoObj);
    if (videoRef.current) {
      videoRef.current.srcObject = videoObj.srcObject;
    }
  }, [videoObj.srcObject]);
  return (
    <video
      id={videoObj.id}
      className="h-28 object-cover aspect-video"
      autoPlay
      playsInline
      muted
      ref={videoRef}
    ></video>
  );
}
