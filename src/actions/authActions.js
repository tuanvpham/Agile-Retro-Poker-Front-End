import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import { SET_CURRENT_USER, GET_ERRORS } from "./types";

export const loginUser = (userData, history) => dispatch => {
  axios
    .post("http://localhost:8000/users/", userData)
    .then(res => {
      // save token to local storage
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);

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

      // redirect to dashboard
      history.push("/home");
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
  //.catch(err => console.log(err.response.data));
};

// set logged in user
export const setCurrentUser = decoded => {
  // dispatch to reducer
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

// log out user
export const logoutUser = () => dispatch => {
  // remove token and auth header
  localStorage.removeItem("jwtToken");
  setAuthToken(false);

  // set current user to empty object
  dispatch(setCurrentUser({}));

  // redirect
  window.location.href = "/";
};
