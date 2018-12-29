import React, { Component } from "react";


export default class Home extends Component {
    render() {
        return (
            <div>
                <h1>Welcome, {this.props.username} </h1>
                <button onClick={this.props.handle_logout}>Logout</button>
            </div>
        );
    }
}