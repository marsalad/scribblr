import React from 'react';
import { StyleSheet, Text, View, TextInput,
  TouchableHighlight, Modal, Button } from 'react-native';

export default class RoomControls extends React.Component {

  record() {
    console.log('Begin Recording')
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
