import React, { Component } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import Spinner from "../common/Spinner";
import CreateRetro from "./CreateRetro";
import CreatePoker from "./CreatePoker";
import ChoosePokerStories from "./ChoosePokerStories";
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
  deleteSession,
  setPokerShow
} from "../../actions/sessionActions";

import "./Dashboard.css";

const delay = ms => new Promise(res => setTimeout(res, ms));

class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      retroShow: false,
      pokerShow: false,
      chooseStoriesShow: false,

      pokersessioncreating: null
    };

    this.socket = new WebSocket("ws://localhost:8000/home/dashboard/");
  }

  componentDidMount() {
    this.props.getAllSessions();

    this.socket.onmessage = e => {
      const dataFromSocket = JSON.parse(e.data);
      if (dataFromSocket.hasOwnProperty("create_session_kate")) {
        this.props.getAllSessions();
      } else if (dataFromSocket.hasOwnProperty("delete_session_kate")) {
        this.props.getAllSessions();
      } else if (dataFromSocket.hasOwnProperty("create_session")) {
        this.props.getAllSessions();
      } else if (dataFromSocket.hasOwnProperty("delete_session")) {
        this.props.getAllSessions();
      }
    };
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

  onSubmit = async (title, description, sessiontype, card_type, velocity) => {
    const session = {
      title: title,
      description: description,
      session_type: sessiontype,
      email: this.props.auth.user.email,
      card_type: card_type.value,
      velocity: velocity
    };

    const sessiontype2 = {
      owner_username: this.props.auth.user.username,
      title: title,
      description: description,
      session_type: sessiontype === "retro" ? "R" : "P",
      card_type: card_type.value,
      velocity: velocity
    };

    this.setState({ pokersessioncreating: sessiontype2 });
    await this.props.createSession(session);

    if (sessiontype === "retro") {
      this.setState({ retroShow: false });
      //this.props.getAllSessions();
      await delay(1000);
      this.socket.send(
        JSON.stringify({
          create_session_kate: "create_session_kate"
        })
      );

      //this.startSession(session);
    }
    if (sessiontype === "poker") {
      await delay(500);
      this.openStorySelection();
    }
  };

  onStorySelect = async ostories => {
    const storysubmit = { stories: ostories };
    console.log("submitting selected stories");

    await this.props.chooseStories(storysubmit);
    this.setState({ pokerShow: false });
    await delay(1000);
    this.socket.send(
      JSON.stringify({
        create_session_kate: "create_session_kate"
      })
    );
    this.setState({ pokerShow: false, storySelectionShow: false });
    //this.startSession(this.state.pokersessioncreating);
  };

  startSession = sessionInfo => {
    this.props.setCurrentSession(sessionInfo);
    //this.props.history.push("/retro");
    this.socket.send(
      JSON.stringify({
        close_socket: "close the home socket"
      })
    );
    this.socket.close();

    this.props.history.push("/lobby");
  };

  onDeleteSession = async sessionid => {
    const session = { session: sessionid };
    await this.props.deleteSession(session);
    await delay(1000);
    //this.props.getAllSessions();
    this.socket.send(
      JSON.stringify({
        delete_session_kate: "Delete session"
      })
    );
  };

  openPoker = () => {
    this.props.setPokerShow(false);

    this.setState({ pokerShow: true });
  };

  openStorySelection = () => {
    this.setState({ pokerShow: false, storySelectionShow: true });
  };

  render() {
    const { user } = this.props.auth;
    const { sessions, loading } = this.props.session;
    const deleteSession = this.onDeleteSession;
    if(sessions !== null && localStorage.getItem('pokerSession') !== null) {
      sessions.forEach(function(session) {
          if(session.title === localStorage.getItem('pokerSession')) {
            deleteSession(session.id);
            localStorage.removeItem('pokerSession');
          }
      })
    }

    let dashboardContent;

    if (sessions === null || loading) {
      dashboardContent = (
        <div>
          {" "}
          <h3
            style={{
              fontSize: "23px",
              color: "#242423",
              marginBottom: "15px"
            }}
          >
            Active Sessions
          </h3>
          <Spinner />
        </div>
      );
    } else {
      // check if there are any sessions
      if (Object.keys(sessions).length > 0) {
        dashboardContent = (
          <div>
            {" "}
            <h3
              style={{
                fontSize: "23px",
                color: "#242423",
                marginBottom: "15px"
              }}
            >
              Active Sessions
            </h3>
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
                            <FaRegStickyNote
                              size={30}
                              style={{ paddingLeft: "10px" }}
                            />
                          </td>
                        ) : (
                          <td>
                            <GiCardRandom
                              size={30}
                              style={{ paddingLeft: "10px" }}
                            />
                          </td>
                        )}

                        <td className="centeredtext">
                          {session.title.replace(/-/g, " ")}
                        </td>
                        <td className="centeredtext">
                          {session.owner_username}
                        </td>
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
          </div>
        );
      } else {
        // if there are no sessions, display a sweet message
        dashboardContent = (
          <center>
            <p />
            <p />
            <p />
            <h4>Create a session to get started!</h4>
          </center>
        );
      }
    }

    return (
      <div className="container">
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
                      sessions={sessions}
                    />

                    <Button
                      variant="primary"
                      className="createbutton"
                      onClick={() => this.openPoker()}
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
                      onClose={this.openStorySelection}
                      sessions={sessions}
                    />

                    <ChoosePokerStories
                      show={this.state.storySelectionShow}
                      onHide={this.pokerClose}
                      onSubmit={this.onSubmit}
                      onStorySelect={this.onStorySelect}
                      session={this.props.session}
                      createSession={this.props.createSession}
                    />
                  </div>
                </div>
                {dashboardContent}
              </div>
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
  setPokerShow: PropTypes.func.isRequired,
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
    deleteSession,
    setPokerShow
  }
)(Dashboard);

//<Button onClick={() => this.startRetro()}>go to retro</Button>
