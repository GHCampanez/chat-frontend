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
            friend: '',
            video: {},
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

    buildApiWithContent = () => {
        return axios.create({
            baseURL: process.env.REACT_APP_API_URL,
            headers: {
                'Authorization': 'Bearer ' + getToken(),
                'Content-Type': 'multipart/form-data'
            }
        })
    }

    sendMessage = () => {

        if (this.state.message.trim() !== '') {
            if (this.state.chatName !== '') {

                const messages = [...this.state.messages, { message: this.state.message, user: this.state.user }]
                if (this.state.video.name) {
                    var formData = new FormData()

                    formData.append('video', this.state.video)
                    formData.append('user', this.state.user)
                    formData.append('chatName', this.state.chatName)
                    formData.append('message', this.state.message)

                    const api = this.buildApiWithContent()

                    api.post('/chat/conversation/video', formData)
                        .then()
                        .catch(err => alert(err.error))
                    document.getElementById('video').value = ''

                } else {
                    const api = this.buildApi()
                    api.post(`/chat/conversation/message`, {
                        chatName: this.state.chatName,
                        message: this.state.message,
                        user: this.state.user
                    })
                        .then()
                        .catch(err => alert(err.error))
                }
                this.setState({ message: '', warning: '', messages, video: {} })
            } else {
                this.setState({ warning: 'Pick a friend before send a message' })
            }

        } else {
            this.setState({ warning: 'Write something before send a message!' })

        }
    };

    selectFriend = friend => {

        const chatName = this.buildChatName(friend.name, this.state.user)
        this.setState({ chatName, friend })

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

    handleChangeFile(e) {

        var video = e.target.files[0]
        if (video) {
            this.setState({ video })
        }

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
                                    <br />
                                    {this.state.friend !== '' ?
                                        <span>Chat with {this.state.friend.name}</span>
                                        :
                                        <span>Select a friend to start a conversation.</span>

                                    }
                                </div>
                                <hr />
                                <div className="messages scroll ">
                                    {this.state.messages.map(message => {
                                        return (
                                            <div>
                                                {message.user}: {message.message}

                                                <div>
                                                    {message.video ?
                                                        <span>{message.user}: <a href={message.video} target='_blank'>Video</a></span>
                                                        : <></>
                                                    }
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                            </div>
                            <div className="card-footer">
                                <input type="text" placeholder="Message" className="form-control" value={this.state.message} onChange={ev => this.setState({ message: ev.target.value })} />
                                <br />

                                {this.state.chatName ?
                                    <div>
                                        <button onClick={() => this.sendMessage()} className="btn btn-primary form-control">Send</button>
                                        <br />

                                        <br />
                                        <input
                                            onChange={(e) => this.handleChangeFile(e)}
                                            className="btn btn-primary m-3"
                                            name="file"
                                            id="video"
                                            type="file"
                                            accept="video/mp4"
                                            placeholder="Add Video File"
                                        />
                                    </div>
                                    :
                                    <span></span>
                                }

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