import axios from "axios";

const setAuthToken = token => {
  if (token) {
    // adds the authorization token to every axios request
    axios.defaults.headers.common["Authorization"] = `JWT ${token}`;
  } else {
    // deletes the auth header for logging out
    delete axios.defaults.headers.common["Authorization"];
  }
};

export default setAuthToken;
