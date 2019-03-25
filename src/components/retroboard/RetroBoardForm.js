import React, { Component } from "react";
import IconButton from "@material-ui/core/IconButton";
import { MdAdd } from "react-icons/md";

class RetroBoardForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemType: this.props.itemType,
      itemText: "",
      session_title: "Retro"
    };
  }

  handleItemTypeChange = e => {
    this.setState({
      itemType: e.target.value
    });
  };

  handleItemTextChange = e => {
    this.setState({
      itemText: e.target.value
    });
  };

  onButton = e => {
    this.props.submitText(e, this.state);
    this.setState({ itemText: "" });
  };

  render() {
    return (
      <div>
        <form onSubmit={e => this.onButton(e)} style={{ display: "flex" }}>
          <input
            type="text"
            name="itemText"
            value={this.state.itemText}
            onChange={this.handleItemTextChange}
          />
          <div
            style={{
              height: "25px",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <IconButton aria-label="submit" type="submit">
              <MdAdd />
            </IconButton>
          </div>
        </form>
      </div>
    );
  }
}

export default RetroBoardForm;
