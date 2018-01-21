import React from 'react';
import { StyleSheet, Text, View, TextInput, Platform,
  TouchableHighlight, Modal, Button, PermissionsAndroid } from 'react-native';

import {AudioRecorder, AudioUtils} from 'react-native-audio';
let audioPath = AudioUtils.DocumentDirectoryPath + '/test.wav';
import openSocket from 'socket.io-client'

export default class RoomControls extends React.Component {

  state = {
    recording: false,
    errors: ''
  }

  prepare() {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "High",
        AudioEncoding: "wav",
        AudioEncodingBitRate: 32000
      });
  }

  componentDidMount() {
    var _this = this;
    this._checkPermission().then((hasPermission) => {
      _this.prepare()
      AudioRecorder.onProgress = (data) => {
          console.log(data)
      };
    })
    this.socket = openSocket('http://10.251.83.168:5000', { transports: ['websocket'] });
    this.socket.on('start-recording', () => this.setState({errors: 'begin le record'}))
  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  async toggleRecord() {
    if(!this.state.recording) {
      try {
        const filePath = await AudioRecorder.startRecording();
        this.setState({recording: true})
      } catch (error) {
        console.error(error);
      }
      var _this = this;
      this._interval = setInterval(() => {
        _this.stopAndSend();
      }, 5000)

    } else {
      const filePath = await AudioRecorder.stopRecording();
      clearInterval(this._interval);
      this.setState({recording: false})
    }
  }

  async stopAndSend() {
    const filePath = await AudioRecorder.stopRecording();
    this.setState({recording: false})
    fileURI = 'file://' + filePath
    const data = new FormData();
    data.append('file', {
      uri: fileURI,
      type: 'audio/wav',
      name: 'file'
    });
    fetch('http://10.251.83.168:5000/stream-audio', {
      method: 'POST',
      body: data
    })
    .then((res) => console.log(res))
    this.prepare()
    try {
      const filePath = await AudioRecorder.startRecording();
      this.setState({recording: true})
    } catch (error) {
      console.error(error);
    }
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


  render() {
    const {state} = this.props.navigation;
    return(
      <View style={styles.container}>
        <Text>{state.params.roomName}</Text>
        <Button
          onPress={() => this.toggleRecord()}
          title= "Record"
        />
      <Text>{this.state.errors}</Text>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
