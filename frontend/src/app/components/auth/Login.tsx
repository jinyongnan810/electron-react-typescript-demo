import React, { useState } from "react";
import { Redirect, useHistory } from "react-router";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { login } from "../../actions/auth";
import Messages from "../Messages";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();
  const dispatch = useAppDispatch();
  const onSubmit = async (e: any) => {
    e.preventDefault();
    dispatch(login(email, password));
  };
  return (
    <div className="card col-6 p-3 position-absolute top-50 start-50 translate-middle">
      <div className="card-title">Log In</div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-lable">
              Email
            </label>
            <input
              className="form-control"
              id="email"
              type="text"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-lable">
              Password
            </label>
            <input
              className="form-control"
              id="password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Messages />
          <button className="btn btn-large btn-outline-success" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
