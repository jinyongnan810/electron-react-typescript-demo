import { AnyAction, Reducer } from "redux";
import * as types from "../actions/types";
interface UserInfoType {
  id: string;
  email: string;
  status: "idle" | "host" | "guest";
  with: { id: string; email: string; status: UserInfoType["status"] }[];
}

interface MeetingInfo {
  users: UserInfoType[];
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
export { MeetingInfo, UserInfoType };
