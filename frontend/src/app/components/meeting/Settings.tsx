import React, { useEffect, useState } from "react";

const Settings = ({ changeLocalStream }: { changeLocalStream: Function }) => {
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const getDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices.forEach((d) => {
      switch (d.kind) {
        case "audioinput":
          setMicrophones([...microphones, d]);
          break;
        case "audiooutput":
          setSpeakers([...speakers, d]);
          break;
        case "videoinput":
          setCameras([...cameras, d]);
          break;
        default:
          break;
      }
    });
  };
  useEffect(() => {
    getDevices();
  }, []);
  const onMicChanges = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      changeLocalStream(e.target.value);
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
            <select className="form-select" aria-label="Speakers" id="speakers">
              {speakers.length > 0 ? (
                speakers.map((s, i) => (
                  <option key={s.deviceId} value={s.deviceId}>
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
              onChange={onMicChanges}
            >
              {microphones.length > 0 ? (
                microphones.map((s, i) => (
                  <option key={s.deviceId} value={s.deviceId}>
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
                  <option key={s.deviceId} value={s.deviceId}>
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
