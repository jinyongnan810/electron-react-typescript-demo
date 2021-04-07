import React, { Fragment, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import * as types from "../actions/types";

const Messages = () => {
  useEffect(() => {
    return function cleanError() {
      if (!maintain) {
        dispatch({ type: types.CLEAR_MESSAGES });
      }
    };
  }, []);
  const { level, messages, maintain } = useAppSelector(
    (state) => state.messages
  );
  const dispatch = useAppDispatch();
  const clearMessages = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dispatch({ type: types.CLEAR_MESSAGES });
  };
  if (!messages || messages.length === 0) {
    return <div></div>;
  }

  let content;
  if (level === "info") {
    content = (
      <ul>
        {messages.map((e) => (
          <li key={Math.random()}>
            {e.field
              ? `${e.field.charAt(0).toUpperCase() + e.field.slice(1)}: `
              : ""}
            {e.message}
          </li>
        ))}
      </ul>
    );
  } else {
    content = (
      <Fragment>
        <h4 className="alert-heading">Oops</h4>
        <p>There are some errors...</p>
        <hr></hr>
        <ul>
          {messages.map((e) => (
            <li key={Math.random()}>
              {e.field
                ? `${e.field.charAt(0).toUpperCase() + e.field.slice(1)}: `
                : ""}
              {e.message}
            </li>
          ))}
        </ul>
      </Fragment>
    );
  }

  return (
    <div
      className={`alert alert-${
        level === "info" ? "success" : level === "error" ? "danger" : "warning"
      } alert-dismissible fade show`}
      role="alert"
    >
      {content}
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={clearMessages}
      ></button>
    </div>
  );
};

export default Messages;
