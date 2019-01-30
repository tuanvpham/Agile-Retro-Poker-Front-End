import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import axios from "axios";
import jwt_decode from "jwt-decode";

// redux
import { Provider } from "react-redux";
import store from "./store";

// components
import Login from "./components/Login";
import Home from "./components/Home";
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
  /*constructor(props) {
    super(props);
    this.state = {
      logged_in: false,
      username: ""
    };
  }*/

  /*componentDidMount() {
    if (this.state.logged_in) {
      fetch("http://localhost:8000/current_user/")
        .then(res => res.json())
        .then(json => {
          this.setState({ username: json.username });
        });
    }
  }*/

  /*handle_authentication = (e, data) => {
    e.preventDefault();
    fetch("http://localhost:8000/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(json => {
        localStorage.setItem("token", json.token);
        this.setState({
          logged_in: true,
          displayed_form: "",
          username: json.username
        });
      });
  };

  handle_logout = () => {
    localStorage.removeItem("token");
    this.setState({ logged_in: false, username: "" });
  };*/

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
              <Route exact path="/home" component={Home} />
            </div>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
