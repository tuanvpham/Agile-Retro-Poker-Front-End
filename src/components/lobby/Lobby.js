import React, { Component } from "react";
import RetroBoard from "../retroboard/RetroBoard";
//import Poker from "./Poker";

// redux imports
import update from "react-addons-update";
import PropTypes from "prop-types";
import { connect } from "react-redux";

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
            <h2>The session has started. Please go back to dashboard</h2>
            <button onClick={() => this.props.history.push("/home")}>
              Go Back
            </button>
            {/*
                            Kate, open a pop up lets user go back to dashboard
                         */}
          </div>
        ) : (
          <div>
            {this.state.isOwnerClicksStartGame ? (
              <div>{this.state.isRetro ? "" : ""}</div>
            ) : (
              <div>
                <h1>
                  {this.props.session.session.session_type === "R"
                    ? "Retrospective Board"
                    : "Planning Poker"}{" "}
                  Lobby: {this.props.session.session.title}
                </h1>
                <p>Host: {this.props.session.session.owner_username}</p>
                <p>Waiting to start game...</p>
                {this.state.isOwner ? (
                  <div>
                    <button onClick={this.startGame}>Start Game</button>
                    <button onClick={this.cancelGame}>Cancel Game</button>
                  </div>
                ) : (
                  <div>
                    <button onClick={this.exitGame}>Exit</button>
                  </div>
                )}
                <PlayerList players={this.state.players} />
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
    <div>
      <li>{item} has joined!</li>
    </div>
  ));
  return <ul>{players}</ul>;
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
