import React, { Component } from "react";

export default class RetroBoardForm extends Component {
  state = {
    itemType: "what_went_well",
    itemText: ""
  };

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
      <form onSubmit={e => this.props.submitText(e, this.state)}>
        <select
          name="itemType"
          value={this.state.itemType}
          onChange={this.handleItemTypeChange}
        >
          <option value="what_went_well">What Went Well</option>
          <option value="what_did_not">What Did Not</option>
          <option value="action_items">Action Items</option>
        </select>
        <input
          type="text"
          name="itemText"
          value={this.state.itemText}
          onChange={this.handleItemTextChange}
        />
        <input type="submit" />
      </form>
    );
  }
}
