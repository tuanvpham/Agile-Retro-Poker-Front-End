import axios from "axios";

import { GET_SESSIONS, SESSION_LOADING, GET_ERRORS } from "./types";

// get all sessions
export const getAllSessions = () => dispatch => {
  dispatch(setSessionLoading());
  axios
    .get("http://localhost:8000/sessions/")
    .then(res =>
      dispatch({
        type: GET_SESSIONS,
        payload: res.data
      })
    )
    .catch(err =>
      dispatch({
        type: GET_SESSIONS,
        payload: {}
      })
    );
};

// create a new session
export const createSession = sessionData => dispatch => {
  axios
    .post("http://localhost:8000/sessions/", sessionData)
    .then(res => {
      console.log(res.data);
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

// sessions loading
export const setSessionLoading = () => {
  return {
    type: SESSION_LOADING
  };
};

// set current session
