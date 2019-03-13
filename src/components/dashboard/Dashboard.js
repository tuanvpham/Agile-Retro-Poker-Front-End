import React, { Component } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getAllSessions,
  createSession,
  setCurrentSession
} from "../../actions/sessionActions";
import Spinner from "../common/Spinner";
import CreateRetro from "./CreateRetro";
import CreatePoker from "./CreatePoker";
import { FaRegStickyNote } from "react-icons/fa";
import { GiCardRandom } from "react-icons/gi";

import "./Dashboard.css";

class Dashboard extends Component {
  constructor() {
    super();
    this.state = { retroShow: false, pokerShow: false };
  }

  componentDidMount() {
    this.props.getAllSessions();
  }

  retroClose = () => {
    this.setState({ retroShow: false });
    console.log(this.retroShow);
  };

  pokerClose = () => {
    this.setState({ pokerShow: false });
    console.log(this.pokerShow);
  };

  onSubmit = (title, description, sessiontype) => {
    const session = {
      title: title,
      description: description,
      session_type: sessiontype
    };

    this.props.createSession(session);
    this.props.getAllSessions();

    this.setState({ retroShow: false, pokerShow: false });
    //console.log(this.retroShow);
  };

  startRetro = sessionInfo => {
    console.log("going to retro session");
    console.log(sessionInfo);
    this.props.setCurrentSession(sessionInfo);
    this.props.history.push("/retro");
  };

  render() {
    const { user } = this.props.auth;
    const { sessions, loading } = this.props.session;
    console.log(sessions);

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
                            onClick={() => this.startRetro(session)}
                          >
                            JOIN
                          </button>
                        </td>
                      ) : (
                        <td>:-)</td>
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
  { getAllSessions, createSession, setCurrentSession }
)(Dashboard);

//<Button onClick={() => this.startRetro()}>go to retro</Button>
