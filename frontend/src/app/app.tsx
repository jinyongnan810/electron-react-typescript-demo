import React from "react";
import { Route, Router, Switch, useHistory } from "react-router";
import {createHashHistory} from "history"
import { ipcRenderer } from "electron";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import Signup from "./components/Signup";
import Login from "./components/Login";
import "./sass/index.scss";
import "../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
const app = () => {
  const signup = (data: { email: String; password: String }) => {
    ipcRenderer.send("auth:signup", data);
  };
  const login = (data: { email: String; password: String }) => {
    ipcRenderer.send("auth:login", data);
  };
  ipcRenderer.on("auth:signup", (event,arg) => {
    if (!arg.error) {
      history.push("/dashboard")
    } else {
      console.log(`Error Sign up:${JSON.stringify(arg.error)}`)
    }
  });
  ipcRenderer.on("auth:login", (event,arg) => {
    if (!arg.error) {
      history.push("/dashboard")
    } else {
      console.log(`Error Login:${JSON.stringify(arg.error)}`)
    }
  });

  const history = createHashHistory()
  return (
    <Router history={history}>
      <Header />
      <div className="container-fluid">
        <Switch>
          <Route path="/signup">
            <Signup signup={signup} />
          </Route>
          <Route path="/login">
            <Login login={login} />
          </Route>
          <Route path="/dashboard" component={Dashboard} />
        </Switch>
      </div>
    </Router>
  );
};

export default app;
