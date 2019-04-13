import React, { Component } from "react";
import "./RetroBoard.css";
import { Table } from "react-bootstrap";
import Spinner from "../common/Spinner";

export default class RetroSummary extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  submittingLoading = () => {
    this.setState({ loading: true });
    this.props.submitToJira();
  };

  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="popup_content">
            <h1 style={{ paddingBottom: "10px" }}>
              {this.props.session.title} - RetroBoard Summary
            </h1>
            {this.state.loading ? (
              <div>
                <Spinner />
              </div>
            ) : (
              <div>
                <div className="innerTable">
                  <p>Action items created:</p>
                  <Stories stories={this.props.actionItems} />
                </div>
              </div>
            )}
          </div>
          {this.state.loading ? null : (
            <div className="popup_footer">
              <button
                onClick={this.props.closeSummary}
                className="closePopupButton"
              >
                Close
              </button>
              <button
                onClick={this.submittingLoading}
                className="submitJiraButton"
              >
                Submit to Jira
              </button>
            </div>
          )}
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
