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
  audioOutputDevice: string | null;
  audioInputDevice: string | null;
}
interface MeetingBaseAction {
  type: string;
  payload?: MeetingInfo["users"] | ConnectedAudioType | string;
}
const initialState: MeetingInfo = {
  users: [],
  audios: [],
  audioOutputDevice: null,
  audioInputDevice: null,
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
      const restAudios = state.audios.filter(
        (a) => (payload as ConnectedAudioType).id !== a.id
      );
      return {
        ...state,
        audios: [...restAudios, payload as ConnectedAudioType],
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
    case types.AUDIO_OUTPUT_DEVICE:
      return {
        ...state,
        audioOutputDevice: payload as string,
      };
    case types.AUDIO_INPUT_DEVICE:
      return {
        ...state,
        audioInputDevice: payload as string,
      };
    default:
      return state;
  }
};
export default meetingReducer;
export { MeetingInfo, UserInfoType };
