import {
  GET_SESSIONS,
  SESSION_LOADING,
  SET_CURRENT_SESSION,
  STORY_SELECT,
  SET_NEWLY_CREATED_SESSION,
  GET_SESSION_STORIES,
  SHOW_POKER_TOGGLE
} from "../actions/types";

const initialState = {
  session: null,
  sessions: null,
  loading: false,
  sessionStories: null,
  newlyCreatedSession: null,
  showPokerToggle: false
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
      return {
        ...state,
        session: action.payload
      };
    case STORY_SELECT:
      return {
        ...state,
        sessionStories: action.payload
      };
    case SET_NEWLY_CREATED_SESSION:
      return {
        ...state,
        newlyCreatedSession: action.payload
      };
    case GET_SESSION_STORIES:
      return {
        ...state,
        sessionStories: action.payload
      };
    case SHOW_POKER_TOGGLE:
      return {
        ...state,
        showPokerToggle: action.payload
      };
    default:
      return state;
  }
}
