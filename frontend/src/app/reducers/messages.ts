import { AnyAction, Reducer } from "redux";
import * as types from "../actions/types";
interface MessagesInfo {
  level: "info" | "warning" | "error";
  messages: {
    message: string;
    field?: string;
  }[];
  maintain: Boolean;
}
interface MessagesBaseAction {
  type: string;
  payload?: MessagesInfo;
}
const initialState: MessagesInfo = {
  level: "info",
  messages: [],
  maintain: false,
};
const messagesReducer: Reducer<MessagesInfo, MessagesBaseAction> = (
  state: MessagesInfo = initialState,
  action: MessagesBaseAction
) => {
  const { type, payload } = action;
  switch (type) {
    case types.SHOW_MESSAGES:
      return {
        level: payload!.level,
        messages: payload!.messages,
        maintain: payload!.maintain ? true : false,
      };
    case types.CLEAR_MESSAGES:
      return { level: "info", messages: [], maintain: false };
    default:
      return state;
  }
};
export default messagesReducer;
export { MessagesInfo };
