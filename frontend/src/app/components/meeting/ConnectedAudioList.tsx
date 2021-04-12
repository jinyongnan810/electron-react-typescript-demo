import { useAppSelector } from "../../../app/hooks";
import React from "react";
import AudioPlayer from "./AudioPlayer";

const ConnectedAudioList = () => {
  const audios = useAppSelector((state) => state.meeting.audios);

  return (
    <div className="d-none">
      {audios.map((a) => (
        <AudioPlayer key={a.id} stream={a.stream} />
      ))}
    </div>
  );
};

export default ConnectedAudioList;
