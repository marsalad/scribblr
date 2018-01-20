import React from 'react';
import { StyleSheet, Text, View, TextInput,
  TouchableHighlight, Modal, Button, PermissionsAndroid } from 'react-native';

import {AudioRecorder, AudioUtils} from 'react-native-audio';
let audioPath = AudioUtils.DocumentDirectoryPath + '/test.aac';

export default class RoomControls extends React.Component {

  state = {
    recording: false
  }

  componentDidMount() {
     /*this._checkPermission().then((hasPermission) => {
        AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "aac",
            AudioEncodingBitRate: 32000
          });

        AudioRecorder.onProgress = (data) => {
            console.log(data)
        };
    }*/
  }

  toggleRecord() {
    if(!this.state.recording) {
      console.log('begin recording')
      try {
        const filePath = await AudioRecorder.startRecording();
        this.setState({recording: true})
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log('stop recording')
      try {
       const filePath = await AudioRecorder.stopRecording();
       if (Platform.OS === 'android') {
         //this._finishRecording(true, filePath);
       }
       //return filePath;
      } catch (error) {
        console.error(error);
      }
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
          onPress={() => this.record()}
          title= "Record"
        />
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
