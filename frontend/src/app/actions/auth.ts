import axios from "axios";
import { Action, AnyAction, Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import * as types from "./types";

const jsonConfig = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const loadUser = (): ThunkAction<
  void,
  Object,
  unknown,
  AnyAction
> => async (dispatch: Dispatch<Action>) => {
  try {
    const res = await axios.get("/api/users/currentuser");
    if (res.data.currentUser) {
      dispatch({
        type: types.USER_LOADED,
        payload: res.data.currentUser,
      });
    } else {
      dispatch({
        type: types.AUTH_ERROR,
      });
    }
  } catch (error) {
    dispatch({
      type: types.AUTH_ERROR,
    });
  }
};

export const login = (
  email: String,
  password: String
): ThunkAction<void, Object, unknown, AnyAction> => async (dispatch) => {
  try {
    const res = await axios.post(
      "/api/users/signin",
      { email, password },
      jsonConfig
    );
    dispatch({
      type: types.LOGIN_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: types.AUTH_ERROR,
    });
  }
};

export const signup = (
  email: String,
  password: String
): ThunkAction<void, Object, unknown, AnyAction> => async (dispatch) => {
  try {
    const res = await axios.post(
      "/api/users/signup",
      { email, password },
      jsonConfig
    );
    dispatch({
      type: types.SIGNUP_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: types.AUTH_ERROR,
    });
  }
};

export const logout = (): ThunkAction<
  void,
  Object,
  unknown,
  AnyAction
> => async (dispatch) => {
  try {
    axios.post("/api/users/signout");
    dispatch({
      type: types.LOGOUT,
    });
  } catch (error) {
    dispatch({
      type: types.AUTH_ERROR,
    });
  }
};
