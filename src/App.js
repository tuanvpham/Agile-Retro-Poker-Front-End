import React, { Component } from "react";
import axios from "axios";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Delloitte Agile Command Central ~</p>
          <div>
            <button type="button" onClick={this.onClick}>
              Send GET request
            </button>
            <p />
          </div>
        </header>
      </div>
    );
  }

  onClick(ev) {
    console.log("Sending a GET API request!!!");
    axios
      .get("http://127.0.0.1:8000/core/")
      .then(res => {
        console.log(res);
      })
      .then(response => {
        console.log(JSON.stringify(response));
      });
  }
}

export default App;
