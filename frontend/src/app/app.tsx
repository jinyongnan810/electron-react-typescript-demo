import React, { useEffect } from "react";
import { Route, Router, Switch, useHistory } from "react-router";
import { Provider } from "react-redux";
import store from "../store";
import { createHashHistory } from "history";

import { ipcRenderer } from "electron";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import Signup from "./components/Signup";
import Login from "./components/Login";
import "./sass/index.scss";
import "../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import { loadUser } from "./actions/auth";

const app = () => {
  axios.defaults.baseURL = "http://localhost:5000";
  axios.defaults.withCredentials = true;
  const history = createHashHistory();
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  return (
    <Provider store={store}>
      <Router history={history}>
        <Header />
        <div className="container-fluid">
          <Switch>
            <Route path="/signup">
              <Signup />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/" component={Dashboard} />
          </Switch>
        </div>
      </Router>
    </Provider>
  );
};

export default app;
