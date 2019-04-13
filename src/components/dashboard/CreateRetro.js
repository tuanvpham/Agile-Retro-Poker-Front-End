import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

import TextFieldGroup from "../common/TextFieldGroup";

class CreateRetro extends Component {
  constructor() {
    super();
    this.state = {
      title: "",
      description: "",
      card_type: {
        value: "fib",
        label:
          "Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, Pass, Coffee )"
      },
      velocity: 0,
      sessiontype: "retro",
      errors: {},
      isInvalidTitle: false
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
    if (
      e.target.value.indexOf("-") !== -1 ||
      e.target.value.indexOf(/\./) !== -1 ||
      e.target.value.length <= 0
    ) {
      this.setState({ isInvalidTitle: true });
    } else {
      this.setState({ isInvalidTitle: false });
    }
    let i = 0;
    for(i = 0; i < this.props.sessions.length; i++) {
      if(this.props.sessions[i].title === e.target.value) {
        this.setState({ isInvalidTitle: true });
        break;
      }
    }
  }

  cancelButton() {
    this.setState({ title: "", description: "", isInvalidTitle: false });
    this.props.onHide();
  }

  submitRetro = () => {
    if(this.state.title.length <= 0) {
      this.setState({
        isInvalidTitle: true
      })

    } else {
      this.props.onSubmit(
        this.state.title.replace(/\s+/g, "-"),
        this.state.description,
        this.state.sessiontype,
        this.state.card_type,
        this.state.velocity
      );

      this.setState({
        title: "",
        description: ""
      });
    }
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
              {this.state.isInvalidTitle == true ? (
                <font color="red">
                  Please enter a valid Session Title.
                </font>
              ) : (
                ""
              )}
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
          <Button variant="outline-success" onClick={() => this.submitRetro()} disabled={this.state.isInvalidTitle}>
            Create Session
          </Button>
          <Button onClick={() => this.cancelButton()}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CreateRetro;
