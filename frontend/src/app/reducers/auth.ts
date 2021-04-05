import { AnyAction, Reducer } from "redux";
import * as types from "../actions/types";
interface UserInfo {
  email?: String;
  id?: String;
  errors?: {
    message: String;
    field?: String;
  }[];
}
interface AuthBaseState {
  isAuthenticated: Boolean | null;
  loading: Boolean;
  user: UserInfo | null;
}
interface AuthBaseAction {
  type: String;
  payload: UserInfo;
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
        user:
          payload.id && payload.email
            ? { id: payload.id, email: payload.email }
            : null,
        isAuthenticated: true,
        loading: false,
      };
    case types.AUTH_ERROR:
      return {
        ...state,
        user: { errors: payload.errors },
        isAuthenticated: false,
        loading: false,
      };
    case types.AUTH_EXPIRED:
    case types.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case types.AUTH_ERROR_CLEAR:
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
