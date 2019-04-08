import React, { Component } from "react";
import IconButton from "@material-ui/core/IconButton";
import { MdCheck } from "react-icons/md";

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
    this.props.addSubmit();
    this.props.submitText(e, this.state);
    this.setState({ itemText: "" });
  };

  render() {
    return (
      <div>
        <form
          onSubmit={e => this.onButton(e)}
          style={{ display: "flex", marginBottom: "10px", marginTop: "10px" }}
        >
          <input
            type="text"
            name="itemText"
            value={this.state.itemText}
            onChange={this.handleItemTextChange}
            autoComplete="off"
          />
          <div
            style={{
              height: "25px",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <IconButton aria-label="submit" type="submit">
              <MdCheck style={{ float: "bottom" }} />
            </IconButton>
          </div>
        </form>
      </div>
    );
  }
}

export default RetroBoardForm;
