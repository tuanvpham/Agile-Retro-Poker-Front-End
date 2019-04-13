import React, { Component } from "react";
import "./Poker.css";
import { Table } from "react-bootstrap";

export default class FinalSummary extends Component {
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
              {this.props.session.title} - Game Summary
            </h1>
            <div className="jiraSuccess">
              Successfully submitted story points to Jira!
            </div>
          </div>
          <div className="popup_footer">
            <button
              onClick={this.props.closeSummary}
              className="closePopupButton2"
            >
              Close
            </button>
            <button
              onClick={() =>
                window.open(
                  "https://agilecommandcentralgroup10.atlassian.net/secure/Dashboard.jspa",
                  "_blank"
                )
              }
              className="viewJiraButton"
            >
              Go to Jira
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function Stories(props) {
  const stories = props.stories.map((item, i) => (
    <tr>
      <td>{item.title}</td>
      <td>{item.points}</td>
    </tr>
  ));
  return <tbody>{stories}</tbody>;
}
