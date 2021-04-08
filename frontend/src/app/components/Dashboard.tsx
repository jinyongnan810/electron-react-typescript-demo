import { useAppSelector } from "../hooks";
import React, { useEffect } from "react";
import { Redirect, useHistory } from "react-router";
import Messages from "./Messages";

const Dashboard = () => {
  let ws: WebSocket | null;
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (isAuthenticated) {
      ws = new WebSocket("ws://localhost:5000/");
      ws.onopen = (e) => {
        ws!.send("Hello from client!");
      };
      ws.onmessage = (e) => {
        console.log(e);
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
      Dashboard
    </div>
  );
};

export default Dashboard;
