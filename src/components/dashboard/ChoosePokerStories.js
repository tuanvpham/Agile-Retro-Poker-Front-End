import React, { Component } from "react";
import { Modal, Button, Checkbox } from "react-bootstrap";
import "./Dashboard.css";
import Spinner from "../common/Spinner";

import TextFieldGroup from "../common/TextFieldGroup";
import DropDownMenu from "../common/DropDownMenu";

// redux imports
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { fetchStories } from "../../actions/sessionActions";
import update from "immutability-helper";

import IconButton from "@material-ui/core/IconButton";
import { MdAdd, MdRemove } from "react-icons/md";

class CreatePoker extends Component {
  constructor() {
    super();
    this.state = {
      title: "",
      description: "",
      card_type: "",
      velocity: 50,
      sessiontype: "poker",
      errors: {},
      sessionCreated: false,
      storySelection: [],
      isDisabled: false,
      storyCount: 0
    };

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    //this.props.fetchStories();
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
    if (
      this.state.title.indexOf("-") !== -1 ||
      this.state.title.indexOf(/\./) !== -1
    ) {
      this.setState({ isDisabled: true });
    } else {
      this.setState({ isDisabled: false });
    }
  }

  onChangeDropdown = selectedOption => {
    console.log(selectedOption.value);
    this.setState({ card_type: selectedOption });
  };

  chooseStoriesButton = async () => {
    await this.props.onSubmit(
      this.state.title.replace(/\s+/g, "-"),
      this.state.description,
      this.state.sessiontype,
      this.state.card_type,
      this.state.velocity
    );
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.session.sessionStories !== null) {
      const stories = Array.from(nextProps.session.sessionStories);
      stories.forEach(story => {
        story.selected = false;
        /*this.setState({
          stories: [...this.state.stories, story]
        });*/
      });

      this.setState({
        sessionCreated: true,
        storySelection: stories
      });
      /*this.setState({
        sessionCreated: true,
        storySelection: Array.from(nextProps.session.sessionStories)
      });

      this.state.storySelection.forEach(story =>
        this.setState({
          storySelection: update(this.state.storySelection, {
            [story]: { selected: { $set: false } }
          })
        })
      );*/
      console.log(this.state.storySelection);
    }
  }

  addStory = itemNum => {
    console.log(itemNum);
    this.setState({
      storySelection: update(this.state.storySelection, {
        [itemNum]: { selected: { $set: true } }
      })
    });
    this.setState({
      storyCount: this.state.storyCount+1
    });
  };

  removeStory = itemNum => {
    this.setState({
      storySelection: update(this.state.storySelection, {
        [itemNum]: { selected: { $set: false } }
      })
    });
    this.setState({
      storyCount: this.state.storyCount-1
    });
  };

  cancelButton() {
    this.setState({ title: "", description: "", card_type: "", velocity: 50 });
    this.props.onHide();
  }

  finalCreatePoker = () => {
    this.setState({
      title: "",
      description: "",
      velocity: 50,
      sessionCreated: false
    });
    this.props.onStorySelect(this.state.storySelection);
    localStorage.removeItem('pokerSession');
  };

  render() {
    return (
      <Modal {...this.props} size="lg">
        <Modal.Header>
          <Modal.Title>Create Planning Poker Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {this.state.storySelection.length === 0 ? (
              <Spinner />
            ) : (
              <div>
                <div
                  style={{
                    width: "48%",
                    marginRight: "5px",
                    float: "left",
                    fontSize: "11px"
                  }}
                >
                  <center>
                    <h4>Available Stories:</h4>
                  </center>
                  {this.state.storySelection.map((story, i) =>
                    !story.selected ? (
                      <div key={i}>
                        <label>
                          <IconButton
                            onClick={() => this.addStory(i)}
                            style={{
                              width: "15px",
                              height: "15px",
                              padding: "0px",
                              marginRight: "3px"
                            }}
                          >
                            <MdAdd />
                          </IconButton>

                          {story.title}
                        </label>
                      </div>
                    ) : null
                  )}
                </div>
                <div
                  style={{
                    width: "48%",
                    marginLeft: "5px",
                    float: "right",
                    fontSize: "11px"
                  }}
                >
                  <center>
                    <h4>Selected:</h4>
                  </center>
                  {this.state.storySelection.map((story, i) =>
                    story.selected ? (
                      <div key={i}>
                        <label>
                          <IconButton
                            onClick={() => this.removeStory(i)}
                            style={{
                              width: "15px",
                              height: "15px",
                              padding: "0px",
                              marginRight: "3px"
                            }}
                          >
                            <MdRemove />
                          </IconButton>
                          {story.title}
                        </label>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div>
            <Button onClick={() => this.finalCreatePoker()} disabled={this.state.storyCount <= 0}>
              Create Session
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

CreatePoker.propTypes = {
  fetchStories: PropTypes.func.isRequired,
  session: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  session: state.session
});

export default connect(
  mapStateToProps,
  { fetchStories }
)(CreatePoker);
