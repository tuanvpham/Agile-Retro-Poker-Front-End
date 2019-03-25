import React, { Component } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import Spinner from "../common/Spinner";
import CreateRetro from "./CreateRetro";
import CreatePoker from "./CreatePoker";
import { FaRegStickyNote } from "react-icons/fa";
import { GiCardRandom } from "react-icons/gi";

// redux imports
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getAllSessions,
  createSession,
  setCurrentSession,
  chooseStories,
  deleteSession
} from "../../actions/sessionActions";

import "./Dashboard.css";

class Dashboard extends Component {
  constructor() {
    super();
    this.state = { retroShow: false, pokerShow: false };
  }

  componentDidMount() {
    this.props.getAllSessions();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.session.sessions !== null &&
      this.props.session.sessions !== null &&
      nextProps.session.sessions.length !== this.props.session.sessions.length
    ) {
      this.props.getAllSessions();
    }
  }

  retroClose = () => {
    this.setState({ retroShow: false });
    console.log(this.retroShow);
  };

  pokerClose = () => {
    this.setState({ pokerShow: false });
    console.log(this.pokerShow);
  };

  onSubmit = async (title, description, sessiontype) => {
    const session = {
      title: title,
      description: description,
      session_type: sessiontype,
      email: this.props.auth.user.email
    };

    await this.props.createSession(session);

    if (sessiontype === "retro") {
      this.setState({ retroShow: false });
      //this.props.getAllSessions();
    }
  };

  onStorySelect = async ostories => {
    const storysubmit = { stories: ostories };
    console.log("submitting selected stories");

    await this.props.chooseStories(storysubmit);

    this.setState({ pokerShow: false });
    this.props.getAllSessions();
  };

  startSession = sessionInfo => {
    console.log("going to session lobby");
    console.log(sessionInfo);
    this.props.setCurrentSession(sessionInfo);
    //this.props.history.push("/retro");
    this.props.history.push("/lobby");
  };

  onDeleteSession = async sessionid => {
    const session = { session: sessionid };
    await this.props.deleteSession(session);
    //this.props.getAllSessions();
  };

  render() {
    const { user } = this.props.auth;
    const { sessions, loading } = this.props.session;

    let dashboardContent;

    if (sessions === null || loading) {
      dashboardContent = <Spinner />;
    } else {
      // check if there are any sessions
      if (Object.keys(sessions).length > 0) {
        dashboardContent = (
          <div className="bigwrapper">
            <Table striped hover>
              <thead>
                <tr className="greytext">
                  <th />
                  <th>SESSION NAME</th>
                  <th>HOST</th>
                  <th colSpan="3">SESSION TYPE</th>
                </tr>
              </thead>
              <tbody>
                {[...sessions].reverse().map((session, i) => {
                  return (
                    <tr key={i} className="centeredtext">
                      {session.session_type === "R" ? (
                        <td>
                          <FaRegStickyNote size={30} />
                        </td>
                      ) : (
                        <td>
                          <GiCardRandom size={30} />
                        </td>
                      )}

                      <td className="centeredtext">{session.title}</td>
                      <td className="centeredtext">{session.owner_username}</td>
                      {session.session_type === "R" ? (
                        <td className="centeredtext">Retrospective Board</td>
                      ) : (
                        <td className="centeredtext">Planning Poker</td>
                      )}

                      {session.session_type === "R" ? (
                        <td>
                          <button
                            className="joinbutton"
                            onClick={() => this.startSession(session)}
                            style={{ marginLeft: "40px" }}
                          >
                            JOIN
                          </button>
                          {session.owner_username ===
                          this.props.auth.user.username ? (
                            <button
                              className="deletebutton"
                              onClick={() => this.onDeleteSession(session.id)}
                            >
                              DELETE
                            </button>
                          ) : (
                            ""
                          )}
                        </td>
                      ) : (
                        <td>
                          <button
                            className="joinbutton"
                            onClick={() => this.startSession(session)}
                            style={{ marginLeft: "40px" }}
                          >
                            JOIN
                          </button>
                          {session.owner_username ===
                          this.props.auth.user.username ? (
                            <button
                              className="deletebutton"
                              onClick={() => this.onDeleteSession(session.id)}
                            >
                              DELETE
                            </button>
                          ) : (
                            ""
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        );
      } else {
        // if there are no sessions, display a sweet message
        dashboardContent = <h4>no sessions. create a session :)</h4>;
      }
    }

    return (
      <div className="dashboard">
        <div>
          <div className="row">
            <div className="col-md-12">
              <h1 className="display-4">Dashboard</h1>
              <div className="buttonWrapper">
                <div className="buttonContainer">
                  <Button
                    variant="primary"
                    className="createbutton"
                    onClick={() => this.setState({ retroShow: true })}
                  >
                    <FaRegStickyNote size={50} />
                    <br />
                    Create Retrospective Board
                  </Button>

                  <CreateRetro
                    show={this.state.retroShow}
                    onHide={this.retroClose}
                    onSubmit={this.onSubmit}
                  />

                  <Button
                    variant="primary"
                    className="createbutton"
                    onClick={() => this.setState({ pokerShow: true })}
                  >
                    <GiCardRandom size={50} />
                    <br />
                    Create Planning Poker
                  </Button>

                  <CreatePoker
                    show={this.state.pokerShow}
                    onHide={this.pokerClose}
                    onSubmit={this.onSubmit}
                    onStorySelect={this.onStorySelect}
                  />
                </div>
              </div>
              {dashboardContent}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  getAllSessions: PropTypes.func.isRequired,
  createSession: PropTypes.func.isRequired,
  setCurrentSession: PropTypes.func.isRequired,
  deleteSession: PropTypes.func.isRequired,
  chooseStories: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  session: state.session,
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  {
    getAllSessions,
    createSession,
    setCurrentSession,
    chooseStories,
    deleteSession
  }
)(Dashboard);

//<Button onClick={() => this.startRetro()}>go to retro</Button>
