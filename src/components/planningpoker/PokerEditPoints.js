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
      <form onSubmit={e => this.props.submitPoints(e, this.state)}>
        <h4 className="pointsDisplay">
          Total Points:{" "}
          <input
            type="text"
            value={this.state.value}
            onChange={this.handleChange}
          />
        </h4>
        <input type="submit" className="saveNewPoints" value="Save Points" />
      </form>
    );
  }
}
