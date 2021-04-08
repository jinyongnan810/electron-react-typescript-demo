import { AnyAction, Reducer } from "redux";
import * as types from "../actions/types";
interface MeetingInfo {
  users: { id: string; email: string }[];
}
interface MeetingBaseAction {
  type: string;
  payload: MeetingInfo["users"];
}
const initialState: MeetingInfo = {
  users: [],
};
const meetingReducer: Reducer<MeetingInfo, MeetingBaseAction> = (
  state: MeetingInfo = initialState,
  action: MeetingBaseAction
) => {
  const { type, payload } = action;
  switch (type) {
    case types.UPDATE_USERS:
      return {
        users: payload,
      };
    default:
      return state;
  }
};
export default meetingReducer;
export { MeetingInfo };
