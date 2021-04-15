import { useAppSelector } from "../../../app/hooks";
import React, { useEffect, useState } from "react";

const AudioPlayer = ({ stream }: { stream: MediaStream }) => {
  const deviceId = useAppSelector((state) => state.meeting.audioOutputDevice);
  const [audio, setAudio] = useState(new Audio());
  useEffect(() => {
    audio.srcObject = stream;
    if (deviceId) {
      if (typeof (audio as any).sinkId !== "undefined") {
        (audio as any).setSinkId(deviceId);
      }
    }
    audio.play();
  }, [deviceId]);

  return <div>Audio Stream</div>;
};

export default AudioPlayer;
