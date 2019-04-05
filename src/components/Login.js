import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import classnames from "classnames";
import { loginUser, oauthUser } from "../actions/authActions";
import TextFieldGroup from "./common/TextFieldGroup";
import OauthPopup from "./OauthPopup";

import "./styling/Login.css";
import Logo from "./common/Logo";

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      errors: {},
      oauth_url: ""
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();

    const user = {
      email: this.state.email,
      password: this.state.password
    };

    // passing this.props.history allows us to redirect within the login action
    this.props.loginUser(user, this.props.history);
  }

  onJiraAuth(e) {
    const tokenData = {
      oauth_token: localStorage.getItem("oauth_token"),
      oauth_token_secret: localStorage.getItem("oauth_token_secret")
    };

    // passing this.props.history allows us to redirect within the login action
    this.props.oauthUser(tokenData, this.props.history);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  // if user is already logged in, redirect
  componentDidMount() {
    console.log(this.props.auth.oAuth);
    if (this.props.auth.oAuth) {
      console.log(this.props.auth.oAuth);
      this.props.history.push("/home");
    }
  }

  // runs when our component receives new properties
  componentWillReceiveProps(nextProps) {
    // if an error is recieved, set it in our component state
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }

    if (nextProps.auth.user.oauth_url) {
      this.setState({ oauth_url: nextProps.auth.user.oauth_url });
      console.log("oauth url set!");
    }
  }

  render() {
    if (this.props.auth.oAuth) {
      this.props.history.push("/home");
    }
    // errors stored in the state
    // equivalent to const errors = this.state.errors;
    // destructuring allows you to pull error out of this.state
    const { errors } = this.state;
    const { isAuthenticated, user } = this.props.auth;

    const onCode = (code, params) => {
      this.onJiraAuth();
    };

    const onClose = () => {
      console.log("closed!");
      console.log(user.oauth_url);
    };

    return (
      <div className="login">
        <div className="wrapper">
          <div id="formContent">
            <Logo />
            <form onSubmit={this.onSubmit}>
              <div id="formFooter">
                <input
                  type="submit"
                  value="Log in with Jira"
                  className="btn btn-info btn-block mt-4"
                />
              </div>
            </form>
          </div>
          {this.state.oauth_url !== "" ? (
            <OauthPopup
              url={this.state.oauth_url}
              onCode={onCode}
              onClose={onClose}
            />
          ) : (
            <div />
          )}
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  oauthUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  // names are chosen in root reducer
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { loginUser, oauthUser }
)(withRouter(Login));
