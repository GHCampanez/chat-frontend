import React, { Component } from 'react'
import axios from 'axios'
import { withRouter } from 'react-router-dom';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

class Register extends Component {

    constructor(props) {
        super(props)
        this.state = {
            users: {},
            name: '',
            password: ''
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

    handleForm = (e) => {
        e.preventDefault()
        api.post('/user/register', {
            name: this.state.name,
            password: this.state.password,
            createdAt: new Date()
        })
            .then(res => {
                alert('New user has been created')
                this.props.history.push('/')
            })
            .catch(err => {
                if (err.request) {
                    console.error(err.request.response)
                    alert(err.request.response)
                }
            })


    }


    render() {

        return (
            <div className="container">
                <div className="row">
                    <div className="col-8">
                        <h2>SingUp</h2>
                        <form onSubmit={(e) => this.handleForm(e)}>
                            <div className="form-group">
                                <label>Name</label>
                                <input onChange={(e) => this.handleInputChange(e)} name="name" type="text" className="form-control" value={this.state.name} id="name" placeholder="Enter a name" />
                                <small id="nameHelp" className="form-text text-muted">Your information is safe with us.</small>
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input onChange={(e) => this.handleInputChange(e)} type="password" className="form-control" value={this.state.password} id="password" name="password" placeholder="Password" />
                            </div>
                            <button type="submit" className="btn btn-info">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}
export default withRouter(Register)
