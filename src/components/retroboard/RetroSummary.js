import React, { Component } from "react";
import "./RetroBoard.css";
import { Table } from "react-bootstrap";

export default class RetroSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="popup_content">
            <h1 style={{ paddingBottom: "10px" }}>
              {this.props.session.title} - RetroBoard Summary
            </h1>
            <div className="innerTable">
              <p>Action items created:</p>
              <Stories stories={this.props.actionItems} />
            </div>
          </div>
          <div className="popup_footer">
            <button
              onClick={this.props.closeSummary}
              className="closePopupButton"
            >
              Close
            </button>
            <button
              onClick={this.props.submitToJira}
              className="submitJiraButton"
            >
              Submit to Jira
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function Stories(props) {
  if (props.stories !== null) {
    const stories = props.stories.map((item, i) => <li>{item.item_text}</li>);
    return <ul>{stories}</ul>;
  } else return <div />;
}
