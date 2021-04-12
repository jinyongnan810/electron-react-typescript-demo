import { useAppDispatch, useAppSelector } from "../hooks";
import React, { useEffect } from "react";
import { Redirect, useHistory } from "react-router";
import Messages from "./Messages";
import UserList from "./meeting/UserList";
import * as wstypes from "../websocket/types";
import * as types from "../actions/types";
import ConnectedAudioList from "./meeting/ConnectedAudioList";
interface RTCPeerInfo {
  id: string;
  rtcConn: RTCPeerConnection;
  stream?: MediaStream;
}
let ws: WebSocket | null;
let rtcConnections: Map<string, RTCPeerInfo> = new Map();
let localStream: MediaStream | null = null;
const rtcConfig = {
  iceCandidatePoolSize: 2,
  iceServers: [
    {
      urls: "stun:stun.l.google.com",
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
// WebRT
const newConnection = (id: string) => {
  const rtcConn = new RTCPeerConnection(rtcConfig);
  rtcConnections.set(id, { id, rtcConn });
  // add tracks
  if (localStream) {
    localStream
      .getAudioTracks()
      .forEach((track) => rtcConn.addTrack(track, localStream!));
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

const getLocalStream = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
  } catch (error) {
    alert(`Cannot get localstream:${JSON.stringify(error)}`);
  }
};

const Dashboard = () => {
  const { isAuthenticated, loading, user } = useAppSelector(
    (state) => state.auth
  );
  const userList = useAppSelector((state) => state.meeting.users);
  const dispatch = useAppDispatch();

  const joinRoom = (to: string) => {
    sendMsg(wstypes.JOIN_ROOM, { to });
  };
  const exitRoom = () => {
    sendMsg(wstypes.EXIT_ROOM, {});
  };
  useEffect(() => {
    if (isAuthenticated) {
      getLocalStream();
      ws = new WebSocket("ws://localhost:5000/");
      ws.onopen = (e) => {
        console.log("Connected to server.");
      };
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        switch (data.type) {
          case wstypes.CURRENT_USERS:
            dispatch({ type: types.UPDATE_USERS, payload: data.data });
            break;
          case wstypes.I_JOINED_ROOM:
            const joined = data.data.id;
            // create connection
            const joinedNewConn = newConnection(joined);
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

          case wstypes.TRANSFER_OFFER:
            const offerFrom = data.data.id;
            const offer = data.data.offer;
            // create connection
            const newConn = newConnection(offerFrom);
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

          default:
            console.log(`Unknown type:${data.type}`);
        }
      };
      ws.onclose = (e) => {
        console.log("Websocket closed.");
        alert("Websocket closed.");
      };
    }
    // clean connections when leaving the page
    return function cleanUp() {
      if (ws) {
        ws!.close();
        ws = null;
        rtcConnections.forEach((conn) => conn.rtcConn.close());
        rtcConnections = new Map();
      }
    };
  }, [loading]);
  return (
    <div>
      <Messages />
      <UserList me={user?.id} joinRoom={joinRoom} exitRoom={exitRoom} />
      <ConnectedAudioList />
    </div>
  );
};

export default Dashboard;
export { RTCPeerInfo };
