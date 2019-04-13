import React, { Component } from "react";
import "./Poker.css";
import { Table } from "react-bootstrap";
import Spinner from "../common/Spinner";

export default class PokerSummary extends Component {
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
              {this.props.session.title} - Game Summary
            </h1>

            {this.state.loading ? (
              <div>
                <Spinner />
              </div>
            ) : (
              <div>
                <div className="innerTable">
                  <Table striped hover>
                    <thead>
                      <tr className="greytext">
                        <th>STORY TITLE</th>
                        <th>SCORE</th>
                      </tr>
                    </thead>

                    <Stories stories={this.props.stories} />
                  </Table>
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
  const stories = props.stories.map((item, i) => (
    <tr>
      <td>{item.title}</td>
      <td>{item.points}</td>
    </tr>
  ));
  return <tbody>{stories}</tbody>;
}
