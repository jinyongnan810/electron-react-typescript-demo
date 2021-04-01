import { AnyAction, Reducer } from "redux";
import * as types from "../actions/types";
interface AuthBaseState {
  isAuthenticated: Boolean | null;
  loading: Boolean;
  user: { email: String; id: String } | null;
}
interface AuthBaseAction {
  type: String;
  payload: { email: String; id: String } | null;
}
const initialState: AuthBaseState = {
  isAuthenticated: null,
  loading: true,
  user: null,
};

const authReducer: Reducer<AuthBaseState, AuthBaseAction> = (
  state: AuthBaseState = initialState,
  action: AuthBaseAction
) => {
  const { type, payload } = action;
  switch (type) {
    case types.USER_LOADED:
    case types.SIGNUP_SUCCESS:
    case types.LOGIN_SUCCESS:
      return {
        ...state,
        user: payload ? { ...payload } : null,
        isAuthenticated: true,
        loading: false,
      };
    case types.AUTH_ERROR:
    case types.LOGIN_ERROR:
    case types.SIGNUP_ERROR:
    case types.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};
export default authReducer;
export { AuthBaseState };
