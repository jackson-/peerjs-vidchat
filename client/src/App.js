import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Peer from 'peerjs'

class App extends Component {
  constructor(){
    super();
    this.state = {
      id:null,
      peer_video_src:null,
      my_video_src:null,
      name:null,
      conn:null,
      peer_id:"",
      messages:[],
      peer:new Peer({
        host: 'localhost',
        port: 9000,
        path: '/peerjs',
        debug: 3,
        config: {'iceServers': [
        { url: 'stun:stun1.l.google.com:19302' },
        { url: 'turn:numb.viagenie.ca',
          credential: 'muazkh', username: 'webrtc@live.com' }
        ]}
      }),
      show_chat:true,
      show_connection:true,
      show_peer_id:true,
      show_connected_peer_container:true,
    }

    this.state.peer.on('open', () => {
      this.setState({id:this.state.peer.id})
    });

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    this.getVideo((stream) => {
      window.localStream = stream;
      this.onReceiveStream(stream, 'my-camera');
    });

    this.state.peer.on('connection', (connection) => {
      connection.on('data', this.handleMessage);
      this.setState({conn:connection, peer_id:connection.peer, show_peer_id:false,
        show_connected_peer_container:true, connected_peer_text:connection.metadata.username})  
    });

    this.state.peer.on('call', (call) => {
      this.onReceiveCall(call);
    });

  }
  
  login(){
    if(this.state.peer_id){
      var conn = this.state.peer.connect(this.state.peer_id, {metadata: {
        'username': this.state.name
      }});
      conn.on('data', this.handleMessage);
      this.setState({conn, show_chat:true, show_connection:false})
    }
  }

  call(){
    var call = this.state.peer.call(this.state.peer_id, window.localStream);
    call.on('stream', (stream) => {
      window.peer_stream = stream;
      this.onReceiveStream(stream, 'peer-camera');
    });
  }

  onReceiveCall(call){
    call.answer(window.localStream);
    call.on('stream', (stream) => {
      window.peer_stream = stream;
      this.onReceiveStream(stream, 'my-camera');
    });
  }
  
  getVideo(callback){
    navigator.getUserMedia({audio: true, video: true}, callback, (error) => {
      console.log(error);
      alert('An error occured. Please try again');
    });
  }

  onReceiveStream(stream, camera){
    if(camera == 'my-camera'){
      this.setState({my_video_src:window.URL.createObjectURL(stream)})
    } else {
      this.setState({peer_video_src:window.URL.createObjectURL(stream)})
    }
    window.peer_stream = stream;
  }

  handleMessage(data){
    var messages = this.state.messages.slice()
    messages.push(data);
    this.setState({messages})
  }

  handleChange(e){
    var change = {}
    change[e.target.name] = e.target.value
    this.setState(change)
  }

  render() {
    return (
      <div id="wrapper">

        <div id="peer-camera" className="camera">
          <video src={this.state.peer_video_src} width="300" height="300" autoPlay></video>
        </div>

        <div id="messenger-wrapper">
          <div className="container">
            <h1>Peer Messenger</h1>
            {this.state.show_connection &&
              <div id="connect">
                <h4>ID: <span id="id">{this.state.id}</span></h4>
                <input type="text" name="name" id="name" placeholder="Name" />
                {this.state.show_peer_id && 
                  <input type="text" name="peer_id" id="peer_id" onChange={(e) => this.handleChange(e)} value={this.state.peer_id} placeholder="Peer ID" />
                }
                {this.state.show_connected_peer_container &&
                  <div id="connected_peer_container" className="hidden">
                    Connected Peer:
                    <span id="connected_peer">{this.state.connected_peer_text}</span>
                  </div>
                }
                <button onClick={() => this.login()} id="login">Login</button>
              </div>
            }
            {this.state.show_chat &&
              <div id="chat" className="hidden">
                <div id="messages-container">
                  <ul id="messages"></ul>
                </div>
                <div id="message-container">
                  <input type="text" name="message" id="message" placeholder="Type message.." />
                  <button id="send-message">Send Message</button>
                  <button onClick={() => this.call()} id="call">Call</button>
                </div>
              </div>
            }
          </div>
        </div>

        <div id="my-camera" className="camera">
          <video src={this.state.my_video_src} width="200" height="200" autoPlay></video>
        </div>
      </div>
    );
  }
}

export default App;
