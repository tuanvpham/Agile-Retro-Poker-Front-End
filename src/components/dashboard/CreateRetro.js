import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

import TextFieldGroup from "../common/TextFieldGroup";

class CreateRetro extends Component {
  constructor() {
    super();
    this.state = {
      title: "",
      description: "",
      sessiontype: "retro",
      errors: {}
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  cancelButton() {
    this.setState({ title: "", description: "" });
    this.props.onHide();
  }

  submitRetro = () => {
    this.props.onSubmit(
      this.state.title.replace(/\s+/g, "-"),
      this.state.description,
      this.state.sessiontype
    );

    this.setState({
      title: "",
      description: ""
    });
  };

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title">
            Create Retrospective Board Session
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
          <Button variant="outline-success" onClick={() => this.submitRetro()}>
            Create Session
          </Button>
          <Button onClick={() => this.cancelButton()}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CreateRetro;
