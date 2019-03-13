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

  render() {
    return (
      <div>
        <input
          type="text"
          name="itemText"
          value={this.state.itemText}
          onChange={this.handleItemTextChange}
        />
        <IconButton
          aria-label="submit"
          onClick={e => this.props.submitText(e, this.state)}
        >
          <MdAdd />
        </IconButton>
      </div>
    );
  }
}

export default RetroBoardForm;
