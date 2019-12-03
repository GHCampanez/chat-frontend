import React from 'react'
import axios from 'axios'
import { withRouter } from 'react-router-dom'
import '../style/Chat.css'
import { logout, getUser, getToken } from "../auth";




class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.match.params.user,
            message: '',
            messages: [],
            users: [],
            warning: '',
            chatName: '',
            interval: setInterval(
                function () {
                    this.getChat(this.state.chatName)
                }
                    .bind(this),
                3000
            ),
            intervalFriends: setInterval(
                function () {
                    this.getFriends()
                }
                    .bind(this),
                10000
            ),
        };

    }

    componentWillMount = () => {
        const { name } = getUser()

        if (this.props.match.params.user !== name) {
            this.setState({ user: name })
            this.props.history.push(`/chat/${name}`)
        }
    }

    componentDidMount = () => {
        this.getFriends()
    }

    getFriends = () => {

        const api = this.buildApi()
        api.get('/chat/users')
            .then(data => {
                let users = data.data.filter(d => d.name !== this.state.user)
                this.setState({ users })
            }).catch(err => console.error(err))
    }

    buildApi = () => {
        return axios.create({
            baseURL: process.env.REACT_APP_API_URL,
            headers: { 'Authorization': 'Bearer ' + getToken() }
        })
    }
    sendMessage = () => {

        if (this.state.message.trim() !== '') {
            if (this.state.chatName !== '') {
                const api = this.buildApi()
                const messages = [...this.state.messages, { message: this.state.message, user: this.state.user }]
                api.post(`/chat/conversation/message`, {
                    chatName: this.state.chatName,
                    message: messages,
                    user: this.state.user 
                })

                this.setState({ message: '', warning: '', messages })
            } else {
                this.setState({ warning: 'Pick a friend before send a message' })
            }

        } else {
            this.setState({ warning: 'Write something before send a message!' })

        }
    };

    selectFriend = friend => {

        const chatName = this.buildChatName(friend.name, this.state.user)
        this.setState({ chatName })

        this.getChat(chatName)
    }

    getChat = (chatName) => {
        console.log(`Buscando chat  ${chatName}`)
        const api = this.buildApi()
        if (chatName !== '')
            api.get(`/chat/conversation?chat=${chatName}`)
                .then(data => {
                    this.setState({ messages: data.data.messages })
                })
    }

    buildChatName(friend, user) {
        let chatName = ((friend + user).replace(/\s+/g, "")).split('')
        chatName.sort()
        chatName = chatName.join('')

        return chatName
    }

    signOut() {

        clearInterval(this.state.interval)
        clearInterval(this.state.intervalFriends)
        logout()
        this.props.history.push('/')
    }

    render() {

        return (
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="card-title">
                                    <h2>Global Chat</h2>
                                    <span>Welcome {this.state.user}</span>
                                </div>
                                <hr />
                                <div className="messages scroll ">
                                    {this.state.messages.map(message => {
                                        return (
                                            <div>{message.user}: {message.message}</div>
                                        )
                                    })}
                                </div>

                            </div>
                            <div className="card-footer">
                                <input type="text" placeholder="Message" className="form-control" value={this.state.message} onChange={ev => this.setState({ message: ev.target.value })} />
                                <br />
                                <button onClick={() => this.sendMessage()} className="btn btn-primary form-control">Send</button>
                                <br />
                                <br />
                                <button type="button" className="btn btn-secondary" data-toggle="modal" data-target="#exampleModal">
                                    Find a friend
                                </button>
                                <button type="button" className="btn btn-danger m-2" onClick={() => this.signOut()}>
                                    Sign Out
                                </button>
                                <small className="form-text text-danger">
                                    {this.state.warning}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="exampleModal" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Find a Friend</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="list-group">
                                    {this.state.users.map(user => {
                                        return (
                                            <button key={user._id} type="submit" onClick={() => this.selectFriend(user)} data-dismiss="modal" className="list-group-item list-group-item-action">{user.name}</button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

export default withRouter(Chat)