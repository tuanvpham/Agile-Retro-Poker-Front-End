import isEmpty from "../validation/is-empty";

import { SET_CURRENT_USER, SET_LOGGED_IN } from "../actions/types";

const initialState = {
  isAuthenticated: false,
  oAuth: false,
  user: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload
      };
    case SET_LOGGED_IN:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        oAuth: !isEmpty(action.payload)
      };
    default:
      return state;
  }
}
