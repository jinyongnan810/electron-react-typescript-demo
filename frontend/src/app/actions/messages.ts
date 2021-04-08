import { Action, AnyAction, Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import * as types from "./types";

export const showMessages = (
  level: "info" | "warning" | "error",
  messages: { message: string; field?: string }[],
  maintain: Boolean = false
): ThunkAction<void, Object, unknown, AnyAction> => async (
  dispatch: Dispatch<Action>
) => {
  dispatch({
    type: types.SHOW_MESSAGES,
    payload: {
      level,
      messages,
      maintain,
    },
  });
};

export const clearMessages = (): ThunkAction<
  void,
  Object,
  unknown,
  AnyAction
> => async (dispatch: Dispatch<Action>) => {
  dispatch({
    type: types.CLEAR_MESSAGES,
  });
};
