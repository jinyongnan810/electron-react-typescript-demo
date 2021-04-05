import React from "react";
import { useAppSelector } from "../../hooks";

const Errors = () => {
  const errors = useAppSelector((state) => state.auth.user?.errors);
  if (!errors) {
    return <div></div>;
  }
  return (
    <div className="alert alert-warning" role="alert">
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
    </div>
  );
};

export default Errors;
