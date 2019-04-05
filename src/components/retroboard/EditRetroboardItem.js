import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

import TextFieldGroup from "../common/TextFieldGroup";

class EditRetroboardItem extends Component {
  constructor() {
    super();
    this.state = {
      itemText: "",
      errors: {}
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  submitEdit = () => {
    this.props.onSubmit(this.state.itemText);
    this.setState({
      itemText: ""
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
          <Modal.Title id="contained-modal-title">Edit Item Text</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <form onSubmit={this.onSubmit}>
              <TextFieldGroup
                name="Edit item"
                type="text"
                multiline="true"
                value={this.state.itemText}
                onChange={this.onChange}
              />
            </form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-success" onClick={() => this.submitEdit()}>
            Create Session
          </Button>
          <Button onClick={this.props.onHide}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default EditRetroboardItem;
