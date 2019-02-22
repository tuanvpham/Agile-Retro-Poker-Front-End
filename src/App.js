import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import axios from "axios";
import jwt_decode from "jwt-decode";

// redux
import { Provider } from "react-redux";
import store from "./store";

import PrivateRoute from "./components/common/PrivateRoute";

// components
import Login from "./components/Login";
import Home from "./components/Home";
import Dashboard from "./components/dashboard/Dashboard";
import Navbar from "./components/layout/Navbar";

import "./App.css";

// check for existing token
if (localStorage.jwtToken) {
  // set the auth token header
  setAuthToken(localStorage.jwtToken);

  // decode token to get info
  const decoded = jwt_decode(localStorage.jwtToken);

  // const decoded = jwt_decode(localStorage);
  axios
    .get("http://localhost:8000/current-user/")
    .then(res => {
      console.log(res.data);
      const user = {
        email: res.data.email,
        username: res.data.username
      };
      store.dispatch(setCurrentUser(user));
    })
    .catch(err => console.log(err.response));

  // check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    // logout user if token is expired & redirect
    store.dispatch(logoutUser());
    window.location.href = "/";
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div>
            <Navbar />
            {/*{this.state.logged_in ? (
            <Home
              handle_logout={this.handle_logout}
              username={this.state.username}
            />
          ) : (
            <Login handle_authentication={this.handle_authentication} />
          )}*/}
            <Route exact path="/" component={Login} />
            <div className="container">
              <Switch>
                <PrivateRoute exact path="/home" component={Dashboard} />
              </Switch>
            </div>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
