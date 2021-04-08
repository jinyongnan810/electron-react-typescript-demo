import { combineReducers } from "redux";
import auth from "./auth";
import messages from "./messages";
import meeting from "./meeting";
export default combineReducers({ auth, messages, meeting });
