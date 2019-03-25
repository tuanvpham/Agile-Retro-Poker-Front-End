import React, { Component } from "react";
import "./Poker.css";

export default class PokerSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <h1>{this.props.session.title} (Poker Summary)</h1>
          <Stories stories={this.props.stories} />
          <button onClick={this.props.closeSummary}>Close</button>
          <button onClick={this.props.submitToJira}>Submit to Jira</button>
        </div>
      </div>
    );
  }
}

function Stories(props) {
  const stories = props.stories.map((item, i) => (
    <div>
      <li>
        {item.title} with {item.points} points
      </li>
    </div>
  ));
  return <ul>{stories}</ul>;
}
