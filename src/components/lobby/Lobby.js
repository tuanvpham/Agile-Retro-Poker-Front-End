import React, { Component } from "react";
import RetroBoard from "../retroboard/RetroBoard";
//import Poker from "./Poker";
import "./Lobby.css";

// redux imports
import update from "react-addons-update";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  MdAdd,
  MdExitToApp,
  MdDoNotDisturbAlt,
  MdPlayCircleFilled
} from "react-icons/md";
import IconButton from "@material-ui/core/IconButton";

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      isOwner: false,
      isOwnerClicksStartGame: false,
      isRetro: false,
      isSessionStarted: false
    };

    this.socket = new WebSocket(
      "ws://localhost:8000/lobby/" +
        this.props.session.session.title +
        "/?" +
        this.props.auth.user.email
    );
  }

  componentDidMount() {
    let url = new URL(
      "http://localhost:8000/session-members/" + this.props.session.session.id
    );
    fetch(url, {
      headers: {
        Authorization: `JWT ${localStorage.getItem("jwtToken")}`
      }
    })
      .then(res => res.json())
      .then(res => {
        for (var key in res) {
          var player = res[key];
          this.setState({
            players: [...this.state.players, player.session_member_username]
          });
        }
      });

    fetch("http://localhost:8000/session-owner/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("jwtToken")}`
      },
      body: JSON.stringify({ session_title: this.props.session.session.title })
    })
      .then(res => res.json())
      .then(json => {
        if (json.is_owner === true) {
          this.setState({
            isOwner: true
          });
        } else {
          console.log("You're a member, not an owner");
        }
      });

    fetch("http://localhost:8000/session-started/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("jwtToken")}`
      },
      body: JSON.stringify({ session_title: this.props.session.session.title })
    })
      .then(res => res.json())
      .then(json => {
        if (json.is_started === true) {
          this.setState({
            isSessionStarted: true
          });
        }
      });

    this.socket.onopen = e => {
      this.socket.send(
        JSON.stringify({
          has_joined: "player joins the session",
          player: this.props.auth.user.email
        })
      );

      switch (this.props.session.session.session_type) {
        case "R":
          this.displayRetro();
          break;
        default:
          break;
      }
    };

    this.socket.onmessage = e => {
      const dataFromSocket = JSON.parse(e.data);
      if (dataFromSocket.hasOwnProperty("has_joined")) {
        switch (dataFromSocket.has_joined) {
          case "User already joined the session":
            break;
          case "New player joined the session":
            const player = dataFromSocket.player;
            this.setState({
              players: [...this.state.players, player]
            });
            break;
          default:
            break;
        }
      } else if (dataFromSocket.hasOwnProperty("start_game")) {
        if (this.props.session.session.session_type === "R") {
          this.props.history.push("/retro");
        } else {
          this.props.history.push("/poker");
        }
        this.socket.close();
      } else if (dataFromSocket.hasOwnProperty("display_retro")) {
        this.setState({
          isRetro: true
        });
      } else if (dataFromSocket.hasOwnProperty("cancel_game")) {
        alert("Owner of this session has cancelled the game.");
        this.socket.close();
        /* 
                    Redirect all users back to dashboard 
                 */
      } else if (dataFromSocket.hasOwnProperty("exit_game")) {
        let indexPlayer = this.state.players.indexOf(dataFromSocket.player);
        this.setState(prevState => ({
          players: prevState.players.filter((_, i) => i !== indexPlayer)
        }));
        this.socket.close();
        /*
                    Redirect user back to dashboard if user is not the owner
                */
      }
    };
  }

  startGame = () => {
    this.socket.send(
      JSON.stringify({ start_game: "Owner wants to start game" })
    );
  };

  cancelGame = () => {
    this.socket.send(
      JSON.stringify({ cancel_game: "Owner wants to cancel game" })
    );
  };

  exitGame = () => {
    this.socket.send(
      JSON.stringify({
        exit_game: "Player wants to exit game",
        player: this.props.auth.user.email
      })
    );
  };

  displayRetro = () => {
    this.socket.send(JSON.stringify({ display_retro: "Retro board" }));
  };

  render() {
    // This cardDeck will be set by poker creation form
    const cardDeck = [
      0,
      1,
      2,
      3,
      5,
      8,
      13,
      21,
      34,
      55,
      89,
      "?",
      "Pass",
      "Coffee Break"
    ];
    return (
      <div>
        {this.state.isSessionStarted ? (
          <div>
            {console.log(
              this.state.players.indexOf(this.props.auth.user.username)
            )}
            <div style={{ marginTop: "250px", color: "grey" }}>
              <center>
                <h2>This session has already started.</h2>
                <IconButton
                  style={{
                    margin: "0px",
                    padding: "0px",
                    zIndex: "1000",
                    backgroundColor: "transparent"
                  }}
                  disableRipple="true"
                  onClick={() => this.props.history.push("/home")}
                >
                  <div
                    style={{
                      display: "grid",
                      marginLeft: "10px",
                      marginTop: "20px"
                    }}
                  >
                    <center>
                      <MdExitToApp size={65} />
                      <p />
                      Go Back
                    </center>
                  </div>
                </IconButton>
              </center>{" "}
            </div>
          </div>
        ) : (
          <div className="lobbyContainer">
            {this.state.isOwnerClicksStartGame ? (
              <div>{this.state.isRetro ? "" : ""}</div>
            ) : (
              <div>
                <div className="headerBox">
                  <h1>
                    {this.props.session.session.session_type === "R"
                      ? "Retrospective Board"
                      : "Planning Poker"}{" "}
                    Lobby: {this.props.session.session.title.replace(/-/g, " ")}
                    <div className="buttonControls">
                      {this.state.isOwner ? (
                        <div>
                          <IconButton
                            style={{
                              margin: "0px",
                              padding: "0px",
                              zIndex: "1000",
                              backgroundColor: "transparent"
                            }}
                            disableRipple="true"
                            onClick={() => this.startGame()}
                          >
                            <div style={{ display: "grid" }}>
                              <center>
                                <MdPlayCircleFilled size={65} />
                                Start Game
                              </center>
                            </div>
                          </IconButton>
                          <IconButton
                            style={{
                              margin: "0px",
                              padding: "0px",
                              zIndex: "1000",
                              backgroundColor: "transparent"
                            }}
                            disableRipple="true"
                            onClick={() => this.cancelGame()}
                          >
                            <div
                              style={{ display: "grid", marginLeft: "10px" }}
                            >
                              <center>
                                <MdExitToApp size={65} />
                                Cancel Game
                              </center>
                            </div>
                          </IconButton>
                        </div>
                      ) : (
                        <div>
                          <IconButton
                            style={{
                              margin: "0px",
                              padding: "0px",
                              zIndex: "1000",
                              backgroundColor: "transparent"
                            }}
                            disableRipple="true"
                            onClick={() => this.exitGame()}
                          >
                            <div
                              style={{ display: "grid", marginLeft: "10px" }}
                            >
                              <center>
                                <MdExitToApp size={65} />
                                Exit
                              </center>
                            </div>
                          </IconButton>
                        </div>
                      )}
                    </div>
                  </h1>
                  <p>
                    <h3>Host: {this.props.session.session.owner_username}</h3>
                  </p>
                </div>
                <div className="playerlist">
                  <center>
                    <h3
                      style={{
                        marginTop: "40px",
                        width: "100%",
                        marginBottom: "20px"
                      }}
                    >
                      Waiting to start game...
                    </h3>
                    <PlayerList players={this.state.players} />
                  </center>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

function PlayerList(props) {
  const players = props.players.map(item => (
    <div style={{ fontSize: "18px" }}>{item} has joined!</div>
  ));
  return <div style={{ width: "100%" }}>{players}</div>;
}

Lobby.propTypes = {
  auth: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  session: state.session
});

export default connect(
  mapStateToProps,
  {}
)(Lobby);
