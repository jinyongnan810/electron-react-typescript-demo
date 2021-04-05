import React from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import * as types from "../../actions/types";

const Errors = () => {
  const errors = useAppSelector((state) => state.auth.user?.errors);
  const dispatch = useAppDispatch();
  const clearErrors = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dispatch({ type: types.AUTH_ERROR_CLEAR });
  };
  if (!errors) {
    return <div></div>;
  }
  return (
    <div
      className="alert alert-warning alert-dismissible fade show"
      role="alert"
    >
      <h4 className="alert-heading">Oops</h4>
      <p>There are some errors...</p>
      <hr></hr>
      <ul>
        {errors.map((e) => (
          <li key={Math.random()}>
            {e.field
              ? `${e.field.charAt(0).toUpperCase() + e.field.slice(1)}: `
              : ""}
            {e.message}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={clearErrors}
      ></button>
    </div>
  );
};

export default Errors;
