import React, { Component } from "react";
import "./RetroBoard.css";
import RetroBoardForm from "./RetroBoardForm";
import update from "react-addons-update";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import { FaEdit, FaTrash } from "react-icons/fa";
import Typography from "@material-ui/core/Typography";

import { slide as Menu } from "react-burger-menu";

import classNames from "classnames";

// Note: Only session owner can see "End Sesion" button

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  }
});

class RetroBoard extends Component {
  constructor(props) {
    super(props);
    this.username = this.props.auth.user.username;
    console.log(this.props.auth.user.email);
    this.state = {
      sessionName: this.props.session.session.title,
      isOwner: false,
      whatWentWellItems: [],
      whatDidNotItems: [],
      actionItems: [],
      sessionId: this.props.session.session.id
    };
    this.socket = new WebSocket(
      "ws://localhost:8000/retro/" +
        this.state.sessionName +
        "/?" +
        this.props.auth.user.email
    );
  }

  componentDidMount() {
    fetch("http://localhost:8000/retro-board-items/", {
      headers: {
        Authorization: `JWT ${localStorage.getItem("jwtToken")}`
      }
    })
      .then(res => res.json())
      .then(res => {
        if (res.detail === "Signature has expired.") {
          this.setState({
            logged_in: false
          });
        } else {
          console.log(res);

          for (var key in res) {
            var retroBoardItem = res[key];
            switch (retroBoardItem.item_type) {
              case "WWW":
                this.setState({
                  whatWentWellItems: [
                    ...this.state.whatWentWellItems,
                    retroBoardItem
                  ]
                });
                break;
              case "WDN":
                this.setState({
                  whatDidNotItems: [
                    ...this.state.whatDidNotItems,
                    retroBoardItem
                  ]
                });
                break;
              case "AI":
                this.setState({
                  actionItems: [...this.state.actionItems, retroBoardItem]
                });
                break;
              default:
                break;
            }
          }
        }
      });

    fetch("http://localhost:8000/session-owner/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("jwtToken")}`
      },
      body: JSON.stringify({ session_title: this.state.sessionName })
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
      console.log(dataFromSocket.hasOwnProperty("exit_session"));
      if (dataFromSocket.hasOwnProperty("end_session_message")) {
        // We should replace alert with something else
        alert(
          dataFromSocket.session_owner +
            " has ended this session!!! Please go back to Dashboard"
        );
        this.socket.close();
        console.log("Kate, redirect user to dashboard here");
      } else if (dataFromSocket.hasOwnProperty("exit_session_message")) {
        alert(this.props.auth.user.username + " left the session");
      } else {
        const retroBoardItem = dataFromSocket;
        this.addRetroBoardItems(retroBoardItem);
      }
    };

    // this.socket.onclose = () => {}
  }

  submitText = (e, data) => {
    e.preventDefault();
    this.socket.send(JSON.stringify(data));
  };

  addRetroBoardItems = item => {
    console.log(item);
    switch (item.item_type) {
      case "WWW":
        this.setState({
          whatWentWellItems: [...this.state.whatWentWellItems, item]
        });
        break;
      case "WDN":
        this.setState({
          whatDidNotItems: [...this.state.whatDidNotItems, item]
        });
        break;
      case "AI":
        this.setState({
          actionItems: [...this.state.actionItems, item]
        });
        break;
      default:
        break;
    }
  };

  endSession = () => {
    this.socket.send(
      JSON.stringify({ end_session: "Owner wants to end this session!" })
    );
    fetch("http://localhost:8000/end_retro/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("jwtToken")}`
      },
      body: JSON.stringify({
        session: this.state.sessionId,
        access_token: localStorage.getItem("access_token"),
        secret_access_token: localStorage.getItem("secret_access_token")
      })
    });
    this.props.history.push("/home");
  };

  exitSession = () => {
    this.socket.send(
      JSON.stringify({ exit_session: "User wants to exit this session!" })
    );
    this.props.history.push("/home");
  };

  editItem = (e, item, i) => {
    var entered_text = "Text Changing";
    var item_state = {
      itemText: item.item_text,
      itemType: item.item_type,
      newItemText: entered_text,
      item_id: item.id ? item.id : item.item_id
    };
    if (item.item_type === "WWW") {
      this.setState({
        whatWentWellItems: update(this.state.whatWentWellItems, {
          [i]: { item_text: { $set: entered_text } }
        })
      });
    } else if (item.item_type === "WDN") {
      this.setState({
        whatDidNotItems: update(this.state.whatDidNotItems, {
          [i]: { item_text: { $set: entered_text } }
        })
      });
    } else if (item.item_type === "AI") {
      this.setState({
        actionItems: update(this.state.actionItems, {
          [i]: { item_text: { $set: entered_text } }
        })
      });
    }
    this.submitText(e, item_state);
  };

  deleteItem = (e, item) => {
    var item_state = {
      itemText: item.item_text,
      itemType: item.item_type,
      item_id: item.id ? item.id : item.item_id,
      delete: true
    };
    if (item.item_type === "WWW") {
      this.setState(prevState => ({
        whatWentWellItems: prevState.whatWentWellItems.filter(el => el != item)
      }));
    } else if (item.item_type === "WDN") {
      this.setState(prevState => ({
        whatDidNotItems: prevState.whatDidNotItems.filter(el => el != item)
      }));
    } else if (item.item_type === "AI") {
      this.setState(prevState => ({
        actionItems: prevState.actionItems.filter(el => el != item)
      }));
    }
    this.submitText(e, item_state);
  };

  render() {
    return (
      <div>
        <h1>Team Name - {this.state.sessionName}</h1>
        <div className="row">
          <div className="column" style={{ border: "none" }}>
            <Card
              style={{
                padding: "10px",
                margin: "10px"
              }}
            >
              <CardContent>
                <Typography
                  gutterBottom
                  variant="h4"
                  component="h2"
                  style={{ paddingBottom: "5px" }}
                >
                  What Went Well
                </Typography>
                <RetroBoardForm
                  submitText={this.submitText}
                  itemType={"what_went_well"}
                />
                <RetroBoardItemList
                  itemList={this.state.whatWentWellItems}
                  username={this.props.auth.user.username}
                  sessionTitle={this.state.sessionName}
                  editItem={this.editItem}
                  deleteItem={this.deleteItem}
                />
              </CardContent>
            </Card>
          </div>
          <div className="column" style={{ border: "none" }}>
            <Card
              style={{
                padding: "10px",
                margin: "10px"
              }}
            >
              <CardContent>
                <Typography
                  gutterBottom
                  variant="h4"
                  component="h2"
                  style={{ paddingBottom: "5px" }}
                >
                  What Didn't
                </Typography>
                <RetroBoardForm
                  submitText={this.submitText}
                  itemType={"what_did_not"}
                />
                <RetroBoardItemList
                  itemList={this.state.whatDidNotItems}
                  username={this.props.auth.user.username}
                  sessionTitle={this.state.sessionName}
                  editItem={this.editItem}
                  deleteItem={this.deleteItem}
                />
              </CardContent>
            </Card>
          </div>

          <div className="column " style={{ border: "none" }}>
            <Card
              style={{
                padding: "10px",
                margin: "10px"
              }}
            >
              <CardContent>
                <Typography
                  gutterBottom
                  variant="h4"
                  component="h2"
                  style={{ paddingBottom: "5px" }}
                >
                  Action Items
                </Typography>
                <RetroBoardForm
                  submitText={this.submitText}
                  itemType={"action_items"}
                />
                <RetroBoardItemList
                  itemList={this.state.actionItems}
                  username={this.props.auth.user.username}
                  sessionTitle={this.state.sessionName}
                  editItem={this.editItem}
                  deleteItem={this.deleteItem}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        {this.state.isOwner ? (
          <button onClick={this.endSession}>End Session</button>
        ) : (
          <div />
        )}
        <button onClick={this.exitSession}>Exit Session</button>
      </div>
    );
  }
}

function RetroBoardItemList(props) {
  const itemList = props.itemList;
  const editItem = props.editItem;
  const deleteItem = props.deleteItem;
  const sessionTitle = props.sessionTitle;
  const username = props.username;
  const email = props.email;
  const items = itemList.map((item, i) =>
    item.session_title === sessionTitle || item.session === sessionTitle ? (
      <Card
        key={i}
        style={{
          marginBottom: "20px",
          left: "0px"
        }}
      >
        <CardContent>{item.item_text}</CardContent>
        {item.owner_username === username || item.item_owner === username ? (
          <CardActions style={{ marginLeft: "75%" }}>
            <IconButton
              aria-label="edit"
              onClick={e => editItem(e, item, i)}
              style={{ padding: "0px" }}
            >
              <FaEdit />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={e => deleteItem(e, item, i)}
            >
              <FaTrash />
            </IconButton>
          </CardActions>
        ) : (
          ""
        )}
      </Card>
    ) : (
      ""
    )
  );
  return (
    <div
      style={{
        maxHeight: 500,
        overflow: "auto"
      }}
    >
      {items}
    </div>
  );
}

RetroBoard.propTypes = {
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
)(RetroBoard);