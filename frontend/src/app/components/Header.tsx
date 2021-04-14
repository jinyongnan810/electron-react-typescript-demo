import { useAppDispatch, useAppSelector } from "../hooks";
import React from "react";
import { Link } from "react-router-dom";
import { logout } from "../actions/auth";

const Header = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const onLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(logout());
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Simple-Chat
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {!auth.loading && auth.isAuthenticated && (
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  {auth.user!.email}'s Dashboard
                </Link>
              </li>
            )}
            {!auth.loading && auth.isAuthenticated && (
              <li className="nav-item">
                <Link
                  to="/"
                  className="nav-link"
                  data-bs-toggle="modal"
                  data-bs-target="#settingModal"
                >
                  Settings
                </Link>
              </li>
            )}
            {!auth.loading && auth.isAuthenticated && (
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={onLogout}>
                  Sign Out
                </Link>
              </li>
            )}

            {!auth.isAuthenticated && (
              <li className="nav-item">
                <Link to="/signup" className="nav-link">
                  Sign Up
                </Link>
              </li>
            )}
            {!auth.isAuthenticated && (
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Log In
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
