import React from 'react';
import { StyleSheet, Text, View, TextInput, Image, Platform,
  Button, PermissionsAndroid } from 'react-native';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
let audioPath = AudioUtils.DocumentDirectoryPath + '/test.wav';
import openSocket from 'socket.io-client'

let domain = '10.251.83.168:5000'
//let domain = 'kerlin.tech:5000'

export default class JoinRoom extends React.Component {

  state = {
    recording: false,
    roomName: '',
    graphicIndex: 0,
    showButton: true,
    room: null,
    recording: false,
    errors: ''
  }

  componentDidMount() {
    var _this = this;
    this._checkPermission().then((hasPermission) => {
      if(hasPermission)
        _this.setState({graphicIndex: 1})
      _this.prepare()
      AudioRecorder.onProgress = (data) => {
          console.log(data)
      };
    })
  }

  prepare() {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "Low",
        AudioEncoding: "aac",
        AudioEncodingBitRate: 32000
      });
  }

  async startRecording() {
    try {
      const filePath = await AudioRecorder.startRecording();
      this.setState({recording: true});
    } catch (error) {
      console.error(error);
    }
  }

  async stopRecording() {
    const filePath = await AudioRecorder.stopRecording();
    this.setState({recording: false});
  }

  async stopRecordingAndSend() {
    const filePath = await AudioRecorder.stopRecording();
    this.setState({recording: false});
    fileURI = 'file://' + filePath
    const data = new FormData();
    data.append('file', {
      uri: fileURI,
      type: 'audio/wav',
      name: 'file'
    });
    fetch(`http://${domain}/stream-audio/${this.state.room}`, {
      method: 'POST',
      body: data
    })
    .then((res) => console.log(res))
  }

  stream() {
    this.prepare()
    this.startRecording()
    var _this = this;
    this._interval = setInterval(() => {
      _this.setState({graphicIndex: 0})
      _this.stopRecordingAndSend();
      _this.prepare();
      _this.startRecording();
    }, 5000)
  }

  stopStream() {
    this.stopRecording();
    clearInterval(this._interval);
  }

  sockets() {
    this.socket = openSocket(`http://${domain}`, { transports: ['websocket'] });
    this.socket.on('start-recording', () => {this.stream(); this.setState({graphicIndex: 1})});
    this.socket.on('stop-recording', () => {this.stopStream(); this.setState({graphicIndex: 0})});
  }

  render() {
    let button = null;
    if(this.state.showButton) {
      button = <Button
                color="#4a667c"
                title="Join Room"
                onPress={() => {this.setState({showButton: false});
                this.setState({room: this.state.roomName}); this.sockets() }}/>
    }
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <View style={styles.buffer}></View>
          <TextInput
            style={styles.roomButton}
            underlineColorAndroid='transparent'
            placeholderTextColor='#280602'
            onChangeText={(roomName) => this.setState({roomName})}
            value={this.state.roomName}
            placeholder='< Room ID >'
          />
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.animation}>
            <Image
              style={{width: 350, height: 350}}
              source={{uri: graphics[this.state.graphicIndex]}}
            />
          </View>
        </View>
        <View>
        {button}
        </View>
      </View>
    );
  }

  _checkPermission() {
    if (Platform.OS !== 'android') {
      return Promise.resolve(true);
    }

    const rationale = {
      'title': 'Microphone Permission',
      'message': 'AudioExample needs access to your microphone so you can record audio.'
    };

    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
      .then((result) => {
        console.log('Permission result:', result);
        return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
      });
  }
}

const graphics = [
  'https://preview.ibb.co/bwTABw/rings.png',
  'https://media.giphy.com/media/3ohc11ZVEOdkJCFffG/giphy.gif'
]

const styles = StyleSheet.create({
  buffer: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222e38'
  },
  topContainer: {
    flex: 1.2,
    justifyContent: 'center'
  },
  bottomContainer: {
    flex: 3,
    justifyContent: 'center'
  },
  roomButton: {
    flex: 0.4,
    color: '#280602',
    borderRadius: 7,
    borderColor: '#280602',
    borderWidth: 1,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'silver',
    fontSize: 25,
    width: 280
  }
});
