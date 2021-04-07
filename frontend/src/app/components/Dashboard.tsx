import { useAppSelector } from "../hooks";
import React, { useEffect } from "react";
import { Redirect, useHistory } from "react-router";
import Messages from "./Messages";

const Dashboard = () => {
  const history = useHistory();
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000/");
    ws.onopen = (e) => {
      ws.send("Hello from client!");
    };
    ws.onmessage = (e) => {
      console.log(e.data);
    };
  }, []);
  return (
    <div>
      <Messages />
      Dashboard
    </div>
  );
};

export default Dashboard;
