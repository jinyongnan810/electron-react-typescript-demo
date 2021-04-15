import { useAppDispatch, useAppSelector } from "../hooks";
import React, { useEffect } from "react";
import { Redirect, useHistory } from "react-router";
import Messages from "./Messages";
import UserList from "./meeting/UserList";
import Settings from "./meeting/Settings";
import * as wstypes from "../websocket/types";
import * as types from "../actions/types";
import ConnectedAudioList from "./meeting/ConnectedAudioList";
import { showMessages } from "../actions/messages";
interface RTCPeerInfo {
  id: string;
  rtcConn: RTCPeerConnection;
  rtcSender?: RTCRtpSender;
  stream?: MediaStream;
}
let ws: WebSocket | null;
let rtcConnections: Map<string, RTCPeerInfo> = new Map();
let localStream: MediaStream | null = null;
let localStreamLoading = false;
const rtcConfig = {
  iceCandidatePoolSize: 2,
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};
const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: false,
};

const sendMsg = (type: string, data: Object) => {
  if (ws) {
    const msg = { type, data };
    ws.send(JSON.stringify(msg));
  }
};
// WebRTC
const newConnection = async (id: string) => {
  await getLocalStream();
  const rtcConn = new RTCPeerConnection(rtcConfig);
  // add tracks
  if (localStream) {
    const sender = rtcConn.addTrack(
      localStream.getAudioTracks()[0],
      localStream!
    );
    rtcConnections.set(id, { id, rtcConn, rtcSender: sender });
  } else {
    console.error("No local stream!");
  }
  // listen for events
  rtcConn.onicecandidate = (e) => {
    if (e.candidate) {
      sendMsg(wstypes.TRANSFER_CANDIDATE, { to: id, candidate: e.candidate });
    }
  };

  return rtcConn;
};
const createOffer = async (id: string, conn: RTCPeerConnection) => {
  const offer = await conn.createOffer(offerOptions);
  await conn.setLocalDescription(offer);
  if (ws) {
    sendMsg(wstypes.TRANSFER_OFFER, { to: id, offer });
  }
};
const whenOfferred = async (id: string, offer: RTCSessionDescription) => {
  const conn = rtcConnections.get(id);
  if (conn) {
    await conn.rtcConn.setRemoteDescription(offer);
    const answer = await conn.rtcConn.createAnswer();
    await conn.rtcConn.setLocalDescription(answer);
    sendMsg(wstypes.TRANSFER_ANSWER, { to: id, answer });
  }
};
const whenAnswered = (id: string, answer: RTCSessionDescription) => {
  const conn = rtcConnections.get(id);
  if (conn) {
    conn.rtcConn.setRemoteDescription(answer);
  }
};
const whenIceCandidate = (id: string, iceCandidate: RTCIceCandidate) => {
  const conn = rtcConnections.get(id);
  if (conn) {
    conn.rtcConn.addIceCandidate(iceCandidate);
  }
};

const getLocalStream = async (audioDevice: string | null = null) => {
  try {
    if (localStreamLoading) {
      return;
    }
    if (localStream) {
      return;
    }
    localStreamLoading = true;
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: audioDevice ? { deviceId: { exact: audioDevice } } : true,
      video: false,
    });
    console.log(localStream);
    localStreamLoading = false;
  } catch (error) {
    console.error(`Cannot get localstream:${JSON.stringify(error)}`);
  }
};
const stopLocalStream = async () => {
  try {
    if (localStream) {
      localStream.getTracks().forEach(function (track) {
        track.stop();
      });
      localStream = null;
    }
  } catch (error) {
    console.error(`Cannot stop localstream:${JSON.stringify(error)}`);
  }
};
const changeLocalStream = async (audioDeviceId: string) => {
  console.log("changeLocalStream");
  if (localStream) {
    // remove tracks from rtcConnections
    rtcConnections.forEach((c) => {
      c.rtcConn.removeTrack(c.rtcSender!);
      console.log("remove track");
    });
    // stop tracks
    await stopLocalStream();
    // get local stream
    await getLocalStream(audioDeviceId);
    // add tracks to all rtcConnections
    if (localStream) {
      rtcConnections.forEach((c) => {
        const sender = c.rtcConn.addTrack(
          localStream!.getAudioTracks()[0],
          localStream!
        );
        c.rtcSender = sender;
        console.log("add track");
      });
    } else {
      console.error("Local stream not found.");
    }
  }
};
const getPermissions = async () => {
  (await navigator.mediaDevices.getUserMedia({ video: true, audio: true }))
    .getTracks()
    .forEach((track) => track.stop());
};

const Dashboard = () => {
  const { isAuthenticated, loading, user } = useAppSelector(
    (state) => state.auth
  );
  const userlist = useAppSelector((state) => state.meeting.users);
  const dispatch = useAppDispatch();

  const joinRoom = (to: string) => {
    sendMsg(wstypes.JOIN_ROOM, { to });
  };
  const exitRoom = () => {
    rtcConnections.forEach((conn) => conn.rtcConn.close());
    rtcConnections = new Map();
    dispatch({ type: types.CLEAR_AUDIO });
    sendMsg(wstypes.EXIT_ROOM, {});
  };
  useEffect(() => {
    if (isAuthenticated) {
      // get device permissions
      getPermissions().then(() => {
        // check permissions
        navigator.permissions.query({ name: "microphone" }).then((res) => {
          if (res.state !== "granted") {
            dispatch(
              showMessages("error", [
                { message: "Microphone access is not permitted!" },
              ])
            );
          }
        });
      });

      // create websocket
      ws = new WebSocket(process.env.WEBSOCKET_URL!);
      ws.onopen = (e) => {
        console.log("Connected to server.");
      };
      ws.onmessage = async (e) => {
        const data = JSON.parse(e.data);
        switch (data.type) {
          case wstypes.CURRENT_USERS:
            dispatch({ type: types.UPDATE_USERS, payload: data.data });
            break;
          case wstypes.I_JOINED_ROOM:
            const joined = data.data.id;
            // create connection
            const joinedNewConn = await newConnection(joined);
            joinedNewConn.ontrack = (e) => {
              const rtcInfo = rtcConnections.get(joined);
              if (rtcInfo) {
                rtcInfo.stream = e.streams[0];
                dispatch({
                  type: types.ADD_AUDIO,
                  payload: { id: joined, stream: rtcInfo.stream },
                });
              }
            };
            // create offer
            createOffer(joined, joinedNewConn);
            break;
          case wstypes.I_EXITED_ROOM:
            let leftRoomUser = rtcConnections.get(data.data.id);
            if (leftRoomUser) {
              leftRoomUser.rtcConn.close();
              rtcConnections.delete(data.data.id);
            }

            dispatch({ type: types.REMOVE_AUDIO, payload: data.data.id });
            break;

          case wstypes.TRANSFER_OFFER:
            const offerFrom = data.data.id;
            const offer = data.data.offer;
            // create connection
            const newConn = await newConnection(offerFrom);
            newConn.ontrack = (e) => {
              const rtcInfo = rtcConnections.get(offerFrom);
              if (rtcInfo) {
                rtcInfo.stream = e.streams[0];
                dispatch({
                  type: types.ADD_AUDIO,
                  payload: { id: offerFrom, stream: rtcInfo.stream },
                });
              }
            };
            // deal with offer and create answer
            whenOfferred(offerFrom, offer);

            break;

          case wstypes.TRANSFER_ANSWER:
            const answerFrom = data.data.id;
            const answer = data.data.answer;
            // deal with answer
            whenAnswered(answerFrom, answer);
            break;

          case wstypes.TRANSFER_CANDIDATE:
            const candidateFrom = data.data.id;
            const candidate = data.data.candidate;
            // deal with icecandidate
            whenIceCandidate(candidateFrom, candidate);
            break;
          case wstypes.ERROR:
            const errors = data.data;
            dispatch(
              showMessages(
                "error",
                errors.map((e: string) => ({ message: e }))
              )
            );
          default:
            console.log(`Unknown type:${data.type}`);
        }
      };
      ws.onclose = (e) => {
        console.error("Websocket closed.");
        dispatch(showMessages("error", [{ message: "Websocket closed." }]));
      };
    }
    // clean connections when leaving the page
    return function cleanUp() {
      if (ws) {
        ws!.close();
        ws = null;
        rtcConnections.forEach((conn) => conn.rtcConn.close());
        rtcConnections = new Map();
        dispatch({ type: types.CLEAR_AUDIO });
      }
    };
  }, [loading]);
  useEffect(() => {
    if (user) {
      const me = userlist.filter((u) => u.id === user.id)[0];
      if (me && me.status === "idle") {
        stopLocalStream();
      }
    }
  }, [userlist]);
  return (
    <div>
      <Messages />
      <UserList me={user?.id} joinRoom={joinRoom} exitRoom={exitRoom} />
      <ConnectedAudioList />
      <Settings changeLocalStream={changeLocalStream} />
    </div>
  );
};

export default Dashboard;
export { RTCPeerInfo };
