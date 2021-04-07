import React from "react";
import { render } from "react-dom";
import { useSelector } from "react-redux";
import { Redirect, Route, RouteProps } from "react-router-dom";

import { RootState } from "../store";

interface Props extends RouteProps {
  component: any;
}

export const PrivateRoute: React.FC<Props> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <Route
      {...rest}
      render={(props) =>
        !isAuthenticated && !loading ? (
          <Redirect to="/login" />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};
