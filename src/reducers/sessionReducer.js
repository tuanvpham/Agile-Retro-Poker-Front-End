import {
  GET_SESSIONS,
  SESSION_LOADING,
  SET_CURRENT_SESSION
} from "../actions/types";

const initialState = {
  session: null,
  sessions: null,
  loading: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SESSION_LOADING:
      return {
        ...state,
        loading: true
      };
    case GET_SESSIONS:
      return {
        ...state,
        sessions: action.payload,
        loading: false
      };
    case SET_CURRENT_SESSION:
      console.log("hi");
      return {
        ...state,
        session: action.payload
      };
    default:
      return state;
  }
}
