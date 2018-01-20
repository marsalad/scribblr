import React from 'react';
import { StyleSheet, Text, View, TextInput,
  TouchableHighlight, Modal, Button } from 'react-native';

export default class JoinRoom extends React.Component {

  state = {
    joinRoomModalVisible: false,
    roomName: ''
  }

  joinRoom() {
    console.log('Choosing Room')
  }

  openJoinRoom() {
    this.setState({joinRoomModalVisible:true});
  }

  closeJoinRoom() {
    this.setState({joinRoomModalVisible:false});
  }


  render() {
    return (
      <View style={styles.container}>
        <Modal
            visible={this.state.joinRoomModalVisible}
            animationType={'slide'}
            onRequestClose={() => this.closeJoinRoom()}
        >
          <View style={styles.modalContainer}>
            <View style={styles.innerContainer}>
              <Text>Input name of room</Text>
              <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 1, width: 300}}
                onChangeText={(roomName) => this.setState({roomName})}
                value={this.state.roomName}
                placeholder="Room Name"
              />
              <Button
                  onPress={() => {this.closeJoinRoom(); this.joinRoom();}}
                  title="Join room"
              />
              <Button
                  onPress={() => {this.closeJoinRoom()}}
                  title="Cancel"
              />
            </View>
          </View>
        </Modal>
        <Text>Scribblr</Text>
        <TouchableHighlight onPress={() => this.openJoinRoom()}>
          <Text>Join Room</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  innerContainer: {
    alignItems: 'center',
  }
});
