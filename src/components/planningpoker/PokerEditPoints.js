import React, { Component } from "react";
import "./Poker.css";

export default class PokerEditPoints extends Component {
  constructor(props) {
    super(props);
    this.state = { value: props.currentStory.points };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    return (
      <div>
        <h4 className="pointsDisplay">Total Points: </h4>
        <input
          type="text"
          className="editpointsinput"
          value={this.state.value}
          onChange={this.handleChange}
        />
        <button
          onClick={e => this.props.submitPoints(e, this.state)}
          className="sidebarbutton"
        >
          Save Points
        </button>
      </div>
    );
  }
}
