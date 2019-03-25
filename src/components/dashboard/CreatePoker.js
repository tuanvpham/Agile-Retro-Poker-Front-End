import React, { Component } from "react";
import { Modal, Button, Checkbox } from "react-bootstrap";

import TextFieldGroup from "../common/TextFieldGroup";

// redux imports
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { fetchStories } from "../../actions/sessionActions";
import update from "immutability-helper";

class CreatePoker extends Component {
  constructor() {
    super();
    this.state = {
      title: "",
      description: "",
      sessiontype: "poker",
      errors: {},
      sessionCreated: false,
      storySelection: []
    };

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    //this.props.fetchStories();
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  chooseStoriesButton = async () => {
    await this.props.onSubmit(
      this.state.title,
      this.state.description,
      this.state.sessiontype
    );
    //this.setState({ sessionCreated: true });
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

      console.log("stories temp array:");
      console.log(stories);

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

  onCheck = itemNum => {
    console.log(itemNum);
    this.setState({
      storySelection: update(this.state.storySelection, {
        [itemNum]: { selected: { $set: true } }
      })
    });
  };

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title">
            Create Planning Poker Session
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!this.state.sessionCreated ? (
            <div>
              <form onSubmit={this.onSubmit}>
                <TextFieldGroup
                  placeholder="Session Name"
                  label="Session Name"
                  name="title"
                  type="text"
                  value={this.state.title}
                  onChange={this.onChange}
                />
                <p />

                <TextFieldGroup
                  placeholder="Description"
                  name="description"
                  label="Description"
                  type="text"
                  multiline="true"
                  value={this.state.description}
                  onChange={this.onChange}
                />
              </form>
            </div>
          ) : (
            <div>
              <center>Select JIRA stories:</center>
              {this.state.storySelection.map((story, i) => (
                <div
                  key={i}
                  style={{ paddingLeft: "20px", paddingRight: "20px" }}
                >
                  <label>
                    <button key={i} id={i} onClick={() => this.onCheck(i)}>
                      ✓{" "}
                    </button>
                    {story.title}
                  </label>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {this.state.sessionCreated ? (
            <Button
              onClick={() =>
                this.props.onStorySelect(this.state.storySelection)
              }
            >
              Create Session
            </Button>
          ) : (
            <div>
              <Button
                variant="outline-success"
                onClick={() => this.chooseStoriesButton()}
              >
                Select Stories
              </Button>
              <Button onClick={this.props.onHide}>Cancel</Button>
            </div>
          )}
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
