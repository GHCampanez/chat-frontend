import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Chat from './components/Chat'
import Notfound from './components/notfound'
import { Route, BrowserRouter as Router, Switch, Redirect  } from 'react-router-dom'
import Register from './components/Register';
import { isAuthenticated } from './isAuthenticated';


const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        isAuthenticated.state ? (
            <Component {...props} />
        ) : (
                <Redirect to={{ pathname: '/', state: { from: props.location } }} />
            )
    )} />
)

const routing = (
    <Router>
        <Switch>
            <Route exact path="/" component={App} />
            <Route exact path="/signup" component={Register} />
            <PrivateRoute exact path="/chat/:user" component={Chat} />
            <Route component={Notfound} />
        </Switch>
    </Router>
)
ReactDOM.render(routing, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
