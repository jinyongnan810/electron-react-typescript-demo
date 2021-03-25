import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router";
const Signup = ({ signup }: { signup: Function }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();
  const onSubmit = async (e: any) => {
    e.preventDefault();
    console.log("onsubmit");
    signup({ email, password });
  };

  return (
    <div className="card col-6 p-3 position-absolute top-50 start-50 translate-middle">
      <div className="card-title">Sign Up</div>
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
          <button
            className="btn btn-large btn-success"
            type="submit"
            onClick={(e) => {
              // console.log("onclick");
              signup({ email, password });
            }}
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
