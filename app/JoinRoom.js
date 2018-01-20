import React from 'react';
import { StyleSheet, Text, View, TextInput, Image } from 'react-native';

export default class JoinRoom extends React.Component {

  state = {
    recording: false,
    roomName: '',
    graphicIndex: 0
  }

  render() {
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
      </View>
    );
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
