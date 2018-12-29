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
        e.preventDefault();
        fetch('http://localhost:8000/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(json => {
            localStorage.setItem('token', json.token);
            this.setState({
                logged_in: true,
                displayed_form: '',
                username: json.username
            });
        });
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
        // let form;
        // switch (this.state.displayed_form) {
        //     case 'signup':
        //         form = <Login handle_signup={this.handle_authentication} />;
        //         break;
        //     default:
        //         form = null;
        // }

        // return (
        //     <div className="App">
        //         <Nav
        //             logged_in={this.state.logged_in}
        //             display_form={this.display_form}
        //             handle_logout={this.handle_logout}
        //         />
        //         {form}
        //         <h3>
        //             {this.state.logged_in
        //                 ? `Hello, ${this.state.username}`
        //                 : 'Please Log In'}
        //         </h3>
        //     </div>
        // );

    }
}

export default App;