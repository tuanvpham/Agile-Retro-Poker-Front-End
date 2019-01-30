import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import classnames from "classnames";
import { loginUser } from "../actions/authActions";

import "./Login.css";

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
    if (this.props.auth.isAuthenticated) {
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
    // errors stored in the state
    // equivalent to const errors = this.state.errors;
    // destructuring allows you to pull error out of this.state
    const { errors } = this.state;

    return (
      <div className="login">
        <div className="wrapper">
          <div id="formContent" className="row">
            <form onSubmit={this.onSubmit}>
              <input
                type="text"
                name="email"
                // form-control form-control-lg will always be in effect,
                // is-invalid will only activate if we get errors.message
                className={classnames("form-control form-control-lg", {
                  "is-invalid": errors.message
                })}
                placeholder="Email Address"
                value={this.state.email}
                onChange={this.onChange}
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                className={classnames("form-control form-control-lg", {
                  "is-invalid": errors.message
                })}
                value={this.state.password}
                onChange={this.onChange}
              />
              {errors.message && (
                <div className="invalid-feedback">{errors.message}</div>
              )}
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
