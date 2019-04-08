import React, { Component } from "react";
import PokerEditPoints from "./PokerEditPoints";
import PokerSummary from "./PokerSummary";
import "./Poker.css";

import IconButton from "@material-ui/core/IconButton";
import { MdChevronRight, MdChevronLeft } from "react-icons/md";
import Collapsible from "react-collapsible";
import { ListItemText } from "@material-ui/core";
import { MdAdd, MdExitToApp, MdDoNotDisturbAlt } from "react-icons/md";

// redux imports
import PropTypes from "prop-types";
import { connect } from "react-redux";

class Poker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stories: [],
      selectedStoryIndex: 0,
      members: [],
      isOwner: false,
      isEndGame: false,
      cardDeck: [
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
      ],
      velocity: this.props.session.session.velocity,
      totalPoints: 0
    };

    this.socket = new WebSocket(
      "ws://localhost:8000/poker/" +
        this.props.session.session.title +
        "/?" +
        this.props.auth.user.email
    );
  }

  componentDidMount() {
    let url = new URL(
      "http://localhost:8000/stories/" + this.props.session.session.id
    );
    fetch(url, {
      headers: {
        Authorization: `JWT ${localStorage.getItem("jwtToken")}`
      }
    })
      .then(res => res.json())
      .then(res => {
        for (var key in res) {
          var story = res[key];
          let modified_story = {
            id: story.id,
            title: story.title,
            description: story.description,
            points: story.story_points,
            key: story.key,
            playedCards: [],
            whoHasPlayed: [],
            card: null,
            isCardFlipped: false,
            isUserPlayed: false,
            isOwnerEdittedPoints: false
          };
          this.setState({
            stories: [...this.state.stories, modified_story]
          });

          if (this.props.session.session.card_type === "modfib") {
            this.setState({
              cardDeck: [
                0,
                1 / 2,
                1,
                2,
                3,
                5,
                8,
                13,
                20,
                40,
                100,
                "?",
                "Pass",
                "Coffee Break"
              ]
            });
          } else if (this.props.session.session.card_type === "seq") {
            this.setState({
              cardDeck: [
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                "?",
                "Pass",
                "Coffee Break"
              ]
            });
          }
        }
        this.updateVelocityProgress();
        console.log(this.state.totalPoints);
      });

    url = new URL(
      "http://localhost:8000/session-members/" + this.props.session.session.id
    );
    fetch(url, {
      headers: {
        Authorization: `JWT ${localStorage.getItem("jwtToken")}`
      }
    })
      .then(res => res.json())
      .then(json => {
        json.forEach(member => {
          this.setState({
            members: [...this.state.members, member]
          });
        });
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

    this.socket.onmessage = e => {
      const dataFromSocket = JSON.parse(e.data);
      if (dataFromSocket.hasOwnProperty("toggle_next_story")) {
        this.toggleNextStory();
      } else if (dataFromSocket.hasOwnProperty("toggle_prev_story")) {
        this.togglePrevStory();
      } else if (dataFromSocket.hasOwnProperty("play_card")) {
        let player = dataFromSocket.player;
        let currentStory = this.state.stories[this.state.selectedStoryIndex];
        if (!currentStory.whoHasPlayed.includes(player)) {
          this.setState(state => ({
            stories: state.stories.map((story, i) => {
              if (i === state.selectedStoryIndex) {
                return {
                  ...story,
                  isUserPlayed: true,
                  whoHasPlayed: [...story.whoHasPlayed, player]
                };
              }
              return story;
            })
          }));
        }
      } else if (dataFromSocket.hasOwnProperty("flip_card")) {
        let currentStory = this.state.stories[this.state.selectedStoryIndex];
        url = new URL(
          "http://localhost:8000/cards/" +
            this.props.session.session.id +
            "/" +
            currentStory.id
        );
        fetch(url, {
          headers: {
            Authorization: `JWT ${localStorage.getItem("jwtToken")}`
          }
        })
          .then(res => res.json())
          .then(json => {
            json.forEach(card => {
              this.setState(state => ({
                stories: state.stories.map((story, i) => {
                  if (i === state.selectedStoryIndex) {
                    return {
                      ...story,
                      playedCards: [...story.playedCards, card]
                    };
                  }
                  return story;
                })
              }));
            });

            let totalPoints = this.calculateStoryPoints();
            if (totalPoints != null) {
              this.setState(state => ({
                stories: state.stories.map((story, i) => {
                  if (i === state.selectedStoryIndex) {
                    return { ...story, points: totalPoints };
                  }
                  return story;
                })
              }));

              if (this.state.isOwner) {
                fetch("http://localhost:8000/update_points/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `JWT ${localStorage.getItem("jwtToken")}`
                  },
                  body: JSON.stringify({
                    id: currentStory.id,
                    points: totalPoints,
                    access_token: localStorage.getItem("access_token"),
                    secret_access_token: localStorage.getItem(
                      "secret_access_token"
                    )
                  })
                });
              }

              this.updateVelocityProgress();
            }

            this.setState(state => ({
              stories: state.stories.map((story, i) => {
                if (i === state.selectedStoryIndex) {
                  return { ...story, isCardFlipped: true };
                }
                return story;
              })
            }));
          });
      } else if (dataFromSocket.hasOwnProperty("submit_points")) {
        let currentStory = this.state.stories[this.state.selectedStoryIndex];
        if (dataFromSocket.story === currentStory.id) {
          this.setState(state => ({
            stories: state.stories.map((story, i) => {
              if (i === state.selectedStoryIndex) {
                return {
                  ...story,
                  points: dataFromSocket.points,
                  isOwnerEdittedPoints: false
                };
              }
              return story;
            })
          }));
          this.updateVelocityProgress();
        }
      } else if (dataFromSocket.hasOwnProperty("reset_cards")) {
        let currentStory = this.state.stories[this.state.selectedStoryIndex];
        if (dataFromSocket.story === currentStory.id) {
          this.setState(state => ({
            stories: state.stories.map((story, i) => {
              if (i === state.selectedStoryIndex) {
                return {
                  ...story,
                  playedCards: [],
                  whoHasPlayed: [],
                  card: null,
                  isCardFlipped: false,
                  isUserPlayed: false,
                  isOwnerEdittedPoints: false
                };
              }
              return story;
            })
          }));
        }
      } else if (dataFromSocket.hasOwnProperty("end_game")) {
        this.setState({ isEndGame: true });
        this.socket.close();
        // remove users from socket
      }
    };

    // kick users out of session here
    this.socket.onclose = () => {
      this.props.history.push("/home");
    };
  }

  toggleNextStory = () => {
    if (this.state.selectedStoryIndex === this.state.stories.length - 1) return;

    this.setState(prevState => ({
      selectedStoryIndex: prevState.selectedStoryIndex + 1
    }));
  };

  togglePrevStory = () => {
    if (this.state.selectedStoryIndex === 0) return;

    this.setState(prevState => ({
      selectedStoryIndex: prevState.selectedStoryIndex - 1
    }));
  };

  nextStory = () => {
    this.socket.send(
      JSON.stringify({
        next_story: "Owner wants to move to next story"
      })
    );
  };

  prevStory = () => {
    this.socket.send(
      JSON.stringify({
        prev_story: "Owner wants to go back to prev story"
      })
    );
  };

  playCards = (e, data) => {
    let currentStory = this.state.stories[this.state.selectedStoryIndex];

    switch (data) {
      case "?":
        data = -1;
        break;
      case "Pass":
        data = -2;
        break;
      case "Coffee Break":
        data = -3;
        break;
      default:
        break;
    }

    this.socket.send(
      JSON.stringify({
        play_card: "User plays a card",
        card: data,
        player: this.props.auth.user.email,
        story: currentStory.id
      })
    );

    this.setState(state => ({
      stories: state.stories.map((story, i) => {
        if (i === state.selectedStoryIndex) {
          return { ...story, card: data };
        }
        return story;
      })
    }));
  };

  exitSession = () => {
    this.props.history.push("/home");
  };

  flipCards = () => {
    let currentStory = this.state.stories[this.state.selectedStoryIndex];
    this.socket.send(
      JSON.stringify({
        flip_card: "Owner wants to flip cards",
        story: currentStory.id
      })
    );
  };

  editPoints = () => {
    this.setState(state => ({
      stories: state.stories.map((story, i) => {
        if (i === state.selectedStoryIndex) {
          return { ...story, isOwnerEdittedPoints: true };
        }
        return story;
      })
    }));
    this.updateVelocityProgress();
  };

  submitPoints = (e, data) => {
    e.preventDefault();
    let currentStory = this.state.stories[this.state.selectedStoryIndex];
    fetch("http://localhost:8000/update_points/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("jwtToken")}`
      },
      body: JSON.stringify({
        id: currentStory.id,
        points: data.value,
        access_token: localStorage.getItem("access_token"),
        secret_access_token: localStorage.getItem("secret_access_token")
      })
    });

    this.socket.send(
      JSON.stringify({
        submit_points: "Owner wants to submit new story points",
        points: data.value,
        story: currentStory.id
      })
    );
    this.updateVelocityProgress();
  };

  resetCards = () => {
    let currentStory = this.state.stories[this.state.selectedStoryIndex];
    this.socket.send(
      JSON.stringify({
        reset_cards: "Owner wants to reset cards",
        story: currentStory.id
      })
    );
  };

  submitToJira = () => {
    /*
        let currentStory = this.state.stories[this.state.selectedStoryIndex]
        this.socket.send(JSON.stringify({
            'end_game': 'Owner wants to end session',
            'story': currentStory.id
        }))
        */
    fetch("http://localhost:8000/end_poker/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("jwtToken")}`
      },
      body: JSON.stringify({
        session: this.props.session.session.id,
        access_token: localStorage.getItem("access_token"),
        secret_access_token: localStorage.getItem("secret_access_token")
      })
    });
  };

  endGame = () => {
    this.setState({
      isEndGame: !this.state.isEndGame
    });
  };

  updateVelocityProgress = () => {
    var totalpoints = 0;
    this.state.stories.forEach(story => {
      console.log(story.points);
      console.log(story);
      if (story.points !== null) {
        totalpoints = totalpoints + parseInt(story.points);
      }
    });

    this.setState({
      totalPoints: totalpoints
    });
    console.log(this.state.totalPoints);
  };

  calculateStoryPoints = () => {
    let currentStory = this.state.stories[this.state.selectedStoryIndex];
    let cardDeck = this.state.cardDeck;
    let points = 0;
    let validPoints = 0;
    currentStory.playedCards.forEach(card => {
      if (card.card >= 0) {
        points += card.card;
        validPoints++;
      }
    });

    if (points >= 0 && validPoints > 0) {
      points = points / validPoints;
      for (let i = 0; i < cardDeck.length; i++) {
        const card = cardDeck[i];
        if (typeof card === "number") {
          if (points <= card) {
            points = card;
            break;
          }
        }
      }
    } else {
      points = null;
    }

    return points;
  };

  render() {
    if (this.state.stories.length === 0) {
      return <div>Loading stories</div>;
    }
    let currentStory = this.state.stories[this.state.selectedStoryIndex];
    return (
      <div className="game">
        <div className="game-main-content">
          <div className="game-board">
            <div className="story-info">
              <h2 style={{}}>
                Planning Poker:{" "}
                {this.props.session.session.title.replace(/-/g, " ")}
              </h2>
              <div className="story-description">
                <h3>Current Story: {currentStory.title}</h3>
                <h5>{currentStory.description}</h5>
              </div>
            </div>

            <div>
              <div className="scroll-container-flex">
                <PokerTable
                  deck={this.state.cardDeck}
                  currentStory={currentStory}
                />
              </div>{" "}
              {this.state.isEndGame ? (
                <PokerSummary
                  stories={this.state.stories}
                  closeSummary={this.endGame}
                  session={this.props.session.session}
                  submitToJira={this.submitToJira}
                />
              ) : null}
            </div>
            <div className="players-cards-container">
              <div className="player-cards-wrapper">
                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, this.state.cardDeck[0])}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-blue">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>{this.state.cardDeck[0]}</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>{this.state.cardDeck[0]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, this.state.cardDeck[1])}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-blue">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>{this.state.cardDeck[1]}</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>{this.state.cardDeck[1]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, this.state.cardDeck[2])}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-blue">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>{this.state.cardDeck[2]}</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>{this.state.cardDeck[2]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, this.state.cardDeck[3])}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-blue">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>{this.state.cardDeck[3]}</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>{this.state.cardDeck[3]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, this.state.cardDeck[4])}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-blue">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>{this.state.cardDeck[4]}</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>{this.state.cardDeck[4]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, this.state.cardDeck[5])}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-blue">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>{this.state.cardDeck[5]}</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>{this.state.cardDeck[5]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, this.state.cardDeck[6])}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-green">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>{this.state.cardDeck[6]}</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>{this.state.cardDeck[6]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, this.state.cardDeck[7])}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-green">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>{this.state.cardDeck[7]}</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>{this.state.cardDeck[7]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, this.state.cardDeck[8])}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-green">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>{this.state.cardDeck[8]}</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>{this.state.cardDeck[8]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, this.state.cardDeck[9])}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-green">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>{this.state.cardDeck[9]}</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>{this.state.cardDeck[9]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, this.state.cardDeck[10])}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-green">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>{this.state.cardDeck[10]}</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>{this.state.cardDeck[10]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, "?")}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-yellow">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>?</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>?</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-rig card-in-hand"
                  onClick={e => this.playCards(e, "Pass")}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-yellow">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>Pass</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>Pass</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-in-hand card-rig-last"
                  onClick={e => this.playCards(e, "Coffee Break")}
                >
                  <div className="card-wrapper perspective-wrapper">
                    <div
                      className="animation-wrapper"
                      style={{ transform: "matrix(1, 0, 0, 1, 0, 0)" }}
                    >
                      <div className="card-container rotate face-up card-yellow">
                        <div className="card card-back" />
                        <div className="card card-face">
                          <div className="small-card-id">
                            <span>Coffee</span>
                          </div>
                          <div className="text-center player-vote">
                            <span>☕</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <span className="stretch" />
              </div>
            </div>
          </div>

          <div className="game-sidebar">
            <div className="sidebar-padding">
              <div className="storyNavigate">
                <span className>TEAM VELOCITY:</span>
              </div>
              <div className="progress-bar">
                <div
                  className="filler"
                  style={{
                    width: `${(this.state.totalPoints / this.state.velocity) *
                      100}%`
                  }}
                />
              </div>
              <div className="storyNavigate2">
                <span>
                  {this.state.totalPoints}/{this.state.velocity}
                </span>
              </div>
            </div>
            <MemberList memberList={this.state.members} />
            <div className="sidebar-padding">
              <div>
                <div className="storyNavigate">
                  <span className>STORY</span>
                  <div className="storyControls">
                    {this.state.isOwner ? (
                      <div>
                        <IconButton onClick={this.prevStory}>
                          <MdChevronLeft size={20} />
                        </IconButton>
                        {this.state.selectedStoryIndex + 1}/
                        {this.state.stories.length}
                        <IconButton onClick={this.nextStory}>
                          <MdChevronRight size={20} />
                        </IconButton>
                      </div>
                    ) : (
                      <div>
                        {this.state.selectedStoryIndex + 1}/
                        {this.state.stories.length}
                      </div>
                    )}

                    {this.state.isOwner ? (
                      <div>
                        <button
                          onClick={this.resetCards}
                          className="sidebarbutton"
                        >
                          Reset Cards
                        </button>
                        {currentStory.whoHasPlayed.length !== 0 &&
                        currentStory.whoHasPlayed.length ===
                          this.state.members.length &&
                        currentStory.isCardFlipped === false ? (
                          <button
                            onClick={this.flipCards}
                            className="sidebarbutton"
                          >
                            Flip Cards
                          </button>
                        ) : (
                          <button disabled className="sidebarbuttonDisabled">
                            Flip Cards
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <TotalPoints
                    isOwner={this.state.isOwner}
                    currentStory={currentStory}
                    editPoints={this.editPoints}
                    submitPoints={this.submitPoints}
                  />
                </div>
              </div>
            </div>

            <Stories
              stories={this.state.stories}
              currentStoryTitle={
                this.state.stories[this.state.selectedStoryIndex].title
              }
            />

            <div className="exitButton">
              <center>
                {this.state.isOwner ? (
                  <div className="pokerExitButtons">
                    <IconButton
                      style={{
                        margin: "0px",
                        padding: "0px",
                        zIndex: "1000",
                        backgroundColor: "transparent"
                      }}
                      disableRipple="true"
                      onClick={() => this.exitSession()}
                    >
                      <div style={{ display: "grid" }}>
                        <MdExitToApp size={65} />
                        Exit Game
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
                      onClick={() => this.endGame()}
                    >
                      <div style={{ display: "grid", marginLeft: "10px" }}>
                        <MdDoNotDisturbAlt size={65} />
                        End Game
                      </div>
                    </IconButton>
                  </div>
                ) : (
                  <button onClick={() => this.exitSession()}>
                    Exit Session
                  </button>
                )}
              </center>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function Stories(props) {
  const stories = props.stories.map((item, i) => (
    <div
      className={
        props.currentStoryTitle === item.title
          ? "selectedStory"
          : "unselectedStory"
      }
    >
      <div className="storyTitles">{item.title}</div>{" "}
      <div className="itemPoints">
        {item.points !== null ? item.points : "-"}
      </div>
    </div>
  ));
  return (
    <Collapsible trigger="List of Stories ▾ " open="true" transitionTime="100">
      {stories}
    </Collapsible>
  );
}

function PokerTable(props) {
  if (props.currentStory.isCardFlipped === false) {
    const players = props.currentStory.whoHasPlayed.map(item => (
      <div className="submittedCardWrapper">
        <div className="card-rig card-in-play">
          <div className="card-wrapper perspective-wrapper">
            <div className="card-container face-down">
              <div className="card card-back" />
            </div>
          </div>
          <div className="label label-inverse label-name">{item}</div>
        </div>
      </div>
    ));

    return <div>{players}</div>;
  }
  const cards = props.currentStory.playedCards.map(item => (
    <div className="submittedCardWrapper">
      <div className="card-rig card-in-play">
        <div className="card-wrapper perspective-wrapper">
          <div
            className={
              item.card > -1 && item.card <= 12
                ? "card-container face-up card-blue"
                : item.card > 12
                ? "card-container face-up card-green"
                : "card-container face-up card-yellow"
            }
          >
            <div className="card card-face">
              <div className="text-center player-vote">
                <span>
                  {item.card === -1
                    ? "?"
                    : item.card === -2
                    ? "Pass"
                    : item.card === -3
                    ? "☕"
                    : item.card}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="label label-inverse label-name">{item.player}</div>
      </div>
    </div>
  ));

  return <div>{cards}</div>;
}

/*function CardDeck(props) {
  let deck;
  if (props.crrentStory.isCardFlipped === false) {
    deck = props.deck.map((item, i) => (
      <button onClick={e => props.playCards(e, item)}>{item}</button>
    ));
  } else {
    deck = props.deck.map((item, i) => <button disabled>{item}</button>);
  }

  return <div>{deck}</div>;
}*/

function MemberList(props) {
  const member = props.memberList.map((item, i) => (
    <div className="unselectedStory">{item.session_member_username}</div>
  ));
  return (
    <Collapsible
      trigger={"Players: " + props.memberList.length + "▾"}
      open="true"
      transitionTime="300"
    >
      {member}
    </Collapsible>
  );
}

function TotalPoints(props) {
  const isOwner = props.isOwner;
  const currentStory = props.currentStory;
  const editPoints = props.editPoints;
  const submitPoints = props.submitPoints;
  if (isOwner) {
    if (currentStory.isOwnerEdittedPoints) {
      return (
        <PokerEditPoints
          currentStory={currentStory}
          submitPoints={submitPoints}
        />
      );
    } else {
      return (
        <div className="pointsDisplay">
          <h4>Total Points: {currentStory.points}</h4>
          <button onClick={editPoints} className="sidebarbutton">
            Edit Points
          </button>
        </div>
      );
    }
  } else {
    return (
      <h4 className="pointsDisplay">Total Points: {currentStory.points}</h4>
    );
  }
}

Poker.propTypes = {
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
)(Poker);
