import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import { SET_CURRENT_USER, GET_ERRORS, SET_LOGGED_IN } from "./types";

export const loginUser = (userData, history) => dispatch => {
  axios
    .get("http://localhost:8000/login/")
    .then(res => {
      // save token to local storage
      const { oauth_token, oauth_token_secret, oauth_url } = res.data;
      localStorage.setItem("oauth_token", oauth_token);
      localStorage.setItem("oauth_token_secret", oauth_token_secret);

      // set current user in redux
      // decode token to get user data
      //const decoded = jwt_decode(token);
      const user = {
        oauth_url: oauth_url
      };
      //dispatch(setCurrentUser(decoded));
      dispatch(setCurrentUser(user));

      // redirect to dashboard
      //history.push("/home");
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
  //.catch(err => console.log(err.response.data));
};

export const oauthUser = (tokenData, history) => dispatch => {
  axios
    .post("http://localhost:8000/oauth_user/", tokenData)
    .then(res => {
      const { token, access_token, secret_access_token } = res.data;

      localStorage.setItem("jwtToken", token);
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("secret_access_token", secret_access_token);

      // set token to authorization header
      setAuthToken(token);

      // set current user in redux
      // decode token to get user data
      //const decoded = jwt_decode(token);
      const user = {
        email: res.data.email,
        username: res.data.username
      };
      //dispatch(setCurrentUser(decoded));
      dispatch(setCurrentUser(user));

      const dummy = {
        logged: "yes"
      };

      dispatch(setLoggedIn(dummy));

      // redirect to dashboard
      history.push("/home");
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

// set logged in user
export const setCurrentUser = decoded => {
  // dispatch to reducer
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

// for after oauth
export const setLoggedIn = dummy => {
  // dispatch to reducer
  return {
    type: SET_LOGGED_IN,
    payload: dummy
  };
};

// log out user
export const logoutUser = () => dispatch => {
  // remove token and auth header
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("oauth_token");
  localStorage.removeItem("oauth_token_secret");
  localStorage.removeItem("access_token");
  localStorage.removeItem("secret_access_token");
  setAuthToken(false);

  // set current user to empty object
  dispatch(setCurrentUser({}));
  dispatch(setLoggedIn({}));

  // redirect
  window.location.href = "/";
};
