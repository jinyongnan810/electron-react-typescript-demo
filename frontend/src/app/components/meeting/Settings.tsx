import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import React, { useEffect, useState } from "react";
import * as types from "../../actions/types";

const Settings = ({ changeLocalStream }: { changeLocalStream: Function }) => {
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const dispatch = useAppDispatch();
  const audioOutputDevice = useAppSelector(
    (state) => state.meeting.audioOutputDevice
  );
  const audioInputDevice = useAppSelector(
    (state) => state.meeting.audioInputDevice
  );
  const getDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setMicrophones(devices.filter((d) => d.kind === "audioinput"));
    setSpeakers(devices.filter((d) => d.kind === "audiooutput"));
    setCameras(devices.filter((d) => d.kind === "videoinput"));
  };
  useEffect(() => {
    getDevices();
    navigator.mediaDevices.addEventListener("devicechange", getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, []);
  const onMicChanges = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      changeLocalStream(e.target.value);
      dispatch({ type: types.AUDIO_INPUT_DEVICE, payload: e.target.value });
    }
  };
  const onSpeakerChanges = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      dispatch({ type: types.AUDIO_OUTPUT_DEVICE, payload: e.target.value });
    }
  };
  return (
    <div
      className="modal fade"
      id="settingModal"
      tabIndex={-1}
      aria-labelledby="settingModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="settingModalLabel">
              Settings
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <label htmlFor="speakers">Select Speaker</label>
            <select
              className="form-select"
              aria-label="Speakers"
              id="speakers"
              defaultValue={audioOutputDevice ?? undefined}
              onChange={onSpeakerChanges}
            >
              {speakers.length > 0 ? (
                speakers.map((s, i) => (
                  <option key={s.groupId + s.deviceId} value={s.deviceId}>
                    {s.label ?? `Speaker ${i + 1}`}
                  </option>
                ))
              ) : (
                <option value="">No Speakers Found</option>
              )}
            </select>
            <label htmlFor="microphones">Select Microphone</label>
            <select
              className="form-select"
              aria-label="Microphones"
              id="microphones"
              defaultValue={audioInputDevice ?? undefined}
              onChange={onMicChanges}
            >
              {microphones.length > 0 ? (
                microphones.map((s, i) => (
                  <option key={s.groupId + s.deviceId} value={s.deviceId}>
                    {s.label ?? `Microphone ${i + 1}`}
                  </option>
                ))
              ) : (
                <option value="">No Microphones Found</option>
              )}
            </select>
            <label htmlFor="cameras">Select Camera</label>
            <select className="form-select" aria-label="Cameras" id="cameras">
              {cameras.length > 0 ? (
                cameras.map((s, i) => (
                  <option key={s.groupId + s.deviceId} value={s.deviceId}>
                    {s.label ?? `Camera ${i + 1}`}
                  </option>
                ))
              ) : (
                <option value="">No Cameras Found</option>
              )}
            </select>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
