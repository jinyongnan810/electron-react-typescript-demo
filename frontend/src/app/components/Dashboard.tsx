import { useAppSelector } from "../hooks";
import React from "react";
import { Redirect, useHistory } from "react-router";
import Messages from "./Messages";

const Dashboard = () => {
  const history = useHistory();
  return (
    <div>
      <Messages />
      Dashboard
    </div>
  );
};

export default Dashboard;
