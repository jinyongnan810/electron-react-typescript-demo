import { useAppDispatch, useAppSelector } from "../hooks";
import React, { useEffect } from "react";
import { Redirect, useHistory } from "react-router";
import Messages from "./Messages";
import UserList from "./meeting/UserList";
import * as wstypes from "../websocket/types";
import * as types from "../actions/types";

const Dashboard = () => {
  let ws: WebSocket | null;
  const { isAuthenticated, loading, user } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();
  const sendMsg = (type: string, data: Object) => {
    if (ws) {
      const msg = { type, data };
      ws.send(JSON.stringify(msg));
    }
  };
  const joinRoom = (to: string) => {
    sendMsg(wstypes.JOIN_ROOM, { to });
  };
  const exitRoom = () => {
    sendMsg(wstypes.EXIT_ROOM, {});
  };
  useEffect(() => {
    if (isAuthenticated) {
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
          default:
            console.log(`Unknown type:${data.type}`);
        }
      };
      ws.onclose = (e) => {
        console.log("Websocket closed.");
        alert("Websocket closed.");
      };
    }

    return function cleanUp() {
      if (ws) {
        ws!.close();
        ws = null;
      }
    };
  }, [loading]);
  return (
    <div>
      <Messages />
      <UserList me={user?.id} joinRoom={joinRoom} exitRoom={exitRoom} />
    </div>
  );
};

export default Dashboard;
