import React from 'react'
import { isAuthenticated } from '../isAuthenticated'
import axios from 'axios'
import {  withRouter} from 'react-router-dom';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: { 'Authorization': 'Bearer ' + isAuthenticated.token }
})


class Home extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            users: {},
            name: '',
            password: '',
            warning: ''
        }

    }

    handleInputChange(e) {
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        const name = target.name

        this.setState({
            [name]: value
        })
    }

    handleForm = async (e) => {
        e.preventDefault()

        if (this.state.name !== '' && this.state.password !== '') {
            await api.post('/user/verify', {
                name: this.state.name,
                password: this.state.password
            })
                .then(res => {
                    isAuthenticated.state = true
                    isAuthenticated.token = res.data.token
                    isAuthenticated.user = res.data.user.name
                    this.props.history.push(`/chat/${res.data.user.name}`)
                })
                .catch(err => {
                    if (err.request) {
                        console.error(err.request.response)
                        this.setState({ warning: 'Please, check your username and password' })
                    }
                })
        } else {
            this.setState({ warning: 'Please, check your username and password' })
        }



    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-8">
                        <h2>Login</h2>
                        <form onSubmit={(e) => this.handleForm(e)}>
                            <div className="form-group">
                                <label>Name</label>
                                <input onChange={(e) => this.handleInputChange(e)} name="name" type="text" className="form-control" value={this.state.name} id="name" placeholder="Enter a name" />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input onChange={(e) => this.handleInputChange(e)} type="password" className="form-control" value={this.state.password} id="password" name="password" placeholder="Password" />
                            </div>
                            <small className="form-text text-danger">
                                {this.state.warning}
                            </small>
                            <button type="submit" className="btn btn-primary">Sign in</button>
                            <button type="button" onClick={() => this.props.history.push('/signup')} className="btn btn-secondary m-2">Sign up</button>

                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Home)

