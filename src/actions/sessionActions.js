import axios from "axios";

import {
  GET_SESSIONS,
  SESSION_LOADING,
  GET_ERRORS,
  SET_CURRENT_SESSION,
  STORY_SELECT,
  SET_NEWLY_CREATED_SESSION,
  GET_SESSION_STORIES
} from "./types";

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
      /*dispatch({
        type: SET_NEWLY_CREATED_SESSION,
        payload: res.data
      });*/
      console.log(res.data.id);

      console.log("sessiondata:");
      console.log(sessionData);

      if (sessionData.session_type === "poker") {
        const fetchStoryData = {
          session: res.data.id,
          access_token: localStorage.getItem("access_token"),
          secret_access_token: localStorage.getItem("secret_access_token")
        };

        dispatch(fetchStories(fetchStoryData));
      }
    }) // here you should call the get all poker stories function w/ this session res.data
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
export const setCurrentSession = sessionData => {
  return {
    type: SET_CURRENT_SESSION,
    payload: sessionData
  };
};

// fetch all Jira stories for selection in planning poker creation
export const fetchStories = sessionData => dispatch => {
  axios
    .post("http://localhost:8000/story_select/", sessionData)
    .then(res => {
      dispatch({
        type: STORY_SELECT,
        payload: res.data
      });

      // new function to fetch the stories for this session and add to sessionStories in redux
      dispatch(fetchSessionStories(sessionData.session));
    })
    .catch(err =>
      dispatch({
        type: STORY_SELECT,
        payload: {}
      })
    );
};

// fetches all the stories assigned to this session
export const fetchSessionStories = sessionID => dispatch => {
  axios.get("http://localhost:8000/stories/" + sessionID).then(res =>
    dispatch({
      type: GET_SESSION_STORIES,
      payload: res.data
    })
  );
};

export const chooseStories = stories => dispatch => {
  axios.post("http://localhost:8000/remove_stories/", stories).then(res => {
    console.log(res);
  });
};

export const deleteSession = session => dispatch => {
  axios.post("http://localhost:8000/delete_session/", session).then(res => {
    console.log(session);
    console.log(res);
  });
};
