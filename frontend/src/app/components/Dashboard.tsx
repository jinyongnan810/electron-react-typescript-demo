import { useAppSelector } from "../hooks";
import React from "react";
import { Redirect, useHistory } from "react-router";
import Messages from "./Messages";

const Dashboard = () => {
  const history = useHistory();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  return (
    <div>
      <Messages />
      Dashboard
    </div>
  );
};

export default Dashboard;
