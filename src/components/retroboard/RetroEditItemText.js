import React, { Component } from "react";
import IconButton from "@material-ui/core/IconButton";
import { MdCheck } from "react-icons/md";

export default class RetroEditItemText extends Component {
  constructor(props) {
    super(props);
    this.editItem = props.editItem;
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      item: props.item,
      index: props.index,
      entered_text: ""
    };
  }

  handleChange(event) {
    this.setState({
      entered_text: event.target.value
    });
  }

  render() {
    return (
      <div>
        <form
          onSubmit={e =>
            this.props.editItem(
              e,
              this.state.item,
              this.state.index,
              this.state.entered_text
            )
          }
          style={{
            display: "flex",
            marginBottom: "10px",
            marginTop: "10px",
            marginLeft: "10px"
          }}
        >
          <input
            type="text"
            value={this.state.entered_text}
            onChange={this.handleChange}
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
