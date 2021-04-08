import { useAppDispatch, useAppSelector } from "../hooks";
import React, { useEffect } from "react";
import { Redirect, useHistory } from "react-router";
import Messages from "./Messages";
import UserList from "./meeting/UserList";
import * as wstypes from "../websocket/types";
import * as types from "../actions/types";

const Dashboard = () => {
  let ws: WebSocket | null;
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
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
      <UserList />
    </div>
  );
};

export default Dashboard;
