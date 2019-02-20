import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import classnames from "classnames";
import { loginUser } from "../actions/authActions";
import TextFieldGroup from "./common/TextFieldGroup";

import "./styling/Login.css";

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      errors: {}
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

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  // if user is already logged in, redirect
  componentDidMount() {
    console.log(this.props.auth.isAuthenticated);
    if (this.props.auth.isAuthenticated) {
      console.log(this.props.auth.isAuthenticated);
      console.log(this.props.auth.isAuthenticated);
      this.props.history.push("/home");
    }
  }

  // runs when our component receives new properties
  componentWillReceiveProps(nextProps) {
    // if an error is recieved, set it in our component state
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  render() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/home");
    }
    // errors stored in the state
    // equivalent to const errors = this.state.errors;
    // destructuring allows you to pull error out of this.state
    const { errors } = this.state;

    return (
      <div className="login">
        <div className="wrapper">
          <div id="formContent">
            <form onSubmit={this.onSubmit}>
              <TextFieldGroup
                placeholder="Email Address"
                name="email"
                type="text"
                value={this.state.email}
                onChange={this.onChange}
                error={errors.message}
              />

              <TextFieldGroup
                placeholder="Password"
                name="password"
                type="password"
                value={this.state.password}
                onChange={this.onChange}
                error={errors.message}
              />

              <div id="formFooter">
                <input
                  type="submit"
                  value="Log in with Jira"
                  className="btn btn-info btn-block mt-4"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
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
  { loginUser }
)(withRouter(Login));
