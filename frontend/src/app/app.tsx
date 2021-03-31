import React from "react";
import { Route, Router, Switch, useHistory } from "react-router";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { ipcRenderer } from "electron";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import Signup from "./components/Signup";
import "./sass/index.scss";
import "../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
const app = () => {
  const history = useHistory();
  const signup = (data: { email: String; password: String }) => {
    ipcRenderer.sendSync("auth:signup", data);
  };
  ipcRenderer.on("auth:signup", (error) => {
    if (!error) {
      history.push("/dashboard");
    } else {
      alert(`Error Sign up:${error}`);
    }
  });
  return (
    <HashRouter>
      <Header />
      <div className="container-fluid">
        <Switch>
          <Route path="/signup">
            <Signup signup={signup} />
          </Route>
          <Route path="/dashboard" component={Dashboard} />
        </Switch>
      </div>
    </HashRouter>
  );
};

export default app;
