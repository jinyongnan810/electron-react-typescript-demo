import React from "react";

const AudioPlayer = ({ stream }: { stream: MediaStream }) => {
  const audio = new Audio();
  audio.srcObject = stream;
  audio.play();
  return <div>Audio...</div>;
};

export default AudioPlayer;
