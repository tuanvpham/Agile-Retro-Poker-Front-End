import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import sessionReducer from "./sessionReducer";

export default combineReducers({
  auth: authReducer,
  errors: errorReducer,
  session: sessionReducer
});
