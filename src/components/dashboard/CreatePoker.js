import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

import TextFieldGroup from "../common/TextFieldGroup";

// redux imports
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { fetchStories } from "../../actions/sessionActions";

class CreatePoker extends Component {
  constructor() {
    super();
    this.state = {
      title: "",
      description: "",
      sessiontype: "poker",
      errors: {}
    };

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.props.fetchStories();
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title">
            Create Planning Poker Session
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <form onSubmit={this.onSubmit}>
              <TextFieldGroup
                placeholder="Session Name"
                label="Session Name"
                name="title"
                type="text"
                value={this.state.title}
                onChange={this.onChange}
              />
              <p />

              <TextFieldGroup
                placeholder="Description"
                name="description"
                label="Description"
                type="text"
                multiline="true"
                value={this.state.description}
                onChange={this.onChange}
              />
            </form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-success"
            onClick={() =>
              this.props.onSubmit(
                this.state.title,
                this.state.description,
                this.state.sessiontype
              )
            }
          >
            Create Session
          </Button>
          <Button onClick={this.props.onHide}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

CreatePoker.propTypes = {
  fetchStories: PropTypes.func.isRequired,
  session: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  session: state.session
});

export default connect(
  mapStateToProps,
  { fetchStories }
)(CreatePoker);
