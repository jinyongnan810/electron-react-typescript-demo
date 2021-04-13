import React, { useEffect } from "react";
import { Route, Router, Switch, useHistory } from "react-router";
import { Provider } from "react-redux";
import store from "./store";
import { createHashHistory } from "history";

import { ipcRenderer } from "electron";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import "./sass/index.scss";
import "../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import { loadUser } from "./actions/auth";
import { PrivateRoute } from "./routes/PrivateRoute";
import { PublicRoute } from "./routes/PublicRoute";

const app = () => {
  axios.defaults.baseURL = process.env.SERVER_URL;
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
            <PublicRoute path="/signup" component={Signup} />
            <PublicRoute path="/login" component={Login} />
            <PrivateRoute path="/" component={Dashboard} />
          </Switch>
        </div>
      </Router>
    </Provider>
  );
};

export default app;
