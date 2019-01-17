import React, { Component } from 'react';
import Login from './components/Login';
import Home from './components/Home';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logged_in: localStorage.getItem('token') ? true : false,
            username: ''
        };
    }

    componentDidMount() {
        if (this.state.logged_in) {
            fetch('http://localhost:8000/current_user/', {
                headers: {
                    Authorization: `JWT ${localStorage.getItem('token')}`
                }
            })
                .then(res => res.json())
                .then(json => {
                    this.setState({ username: json.username });
                });
        }
    }

    handle_authentication = (e, data) => {
        e.preventDefault()
        let resStatus = 0
        fetch('http://localhost:8000/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(
            res => {
                resStatus = res.status
                console.log(resStatus)
                return res.json()
            }
        )
        .then(json => {
            switch (resStatus) {
                case 400:
                    console.log("Cannot create new user on API")
                    break
                case 401:
                    console.log("Wrong username or password")
                    break
                case 408:
                    console.log("Jira authenticated timed out")
                    break
                case 500:
                    console.log("Internal server error")
                    break
                default:
                    localStorage.setItem('token', json.token)
                    this.setState({
                        logged_in: true,
                        username: json.username
                    })
                    break
            }
        })
        .catch(err => console.log("Cannot connect to API"));
    };

    handle_logout = () => {
        localStorage.removeItem('token');
        this.setState({ logged_in: false, username: '' });
    };

    render() {
        return (
            <div>
                {this.state.logged_in ? 
                    <Home handle_logout={this.handle_logout} username={this.state.username} /> : 
                    <Login handle_authentication={this.handle_authentication} />
                }
            </div>
        );
    }
}

export default App;