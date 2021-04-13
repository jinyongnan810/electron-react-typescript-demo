import { AnyAction, Reducer } from "redux";
import * as types from "../actions/types";
interface UserInfoType {
  id: string;
  email: string;
  status: "idle" | "host" | "guest";
  with: {
    id: string;
    email: string;
    status: UserInfoType["status"];
  }[];
}
interface ConnectedAudioType {
  id: string;
  stream: MediaStream;
}

interface MeetingInfo {
  users: UserInfoType[];
  audios: ConnectedAudioType[];
}
interface MeetingBaseAction {
  type: string;
  payload?: MeetingInfo["users"] | ConnectedAudioType | string;
}
const initialState: MeetingInfo = {
  users: [],
  audios: [],
};
const meetingReducer: Reducer<MeetingInfo, MeetingBaseAction> = (
  state: MeetingInfo = initialState,
  action: MeetingBaseAction
) => {
  const { type, payload } = action;
  switch (type) {
    case types.UPDATE_USERS:
      return {
        ...state,
        users: payload as MeetingInfo["users"],
      };
    case types.ADD_AUDIO:
      return {
        ...state,
        audios: [...state.audios, payload as ConnectedAudioType],
      };
    case types.REMOVE_AUDIO:
      const newAudios = state.audios.filter((a) => a.id !== payload);
      return {
        ...state,
        audios: newAudios,
      };
    case types.CLEAR_AUDIO:
      return {
        ...state,
        audios: [],
      };
    default:
      return state;
  }
};
export default meetingReducer;
export { MeetingInfo, UserInfoType };
