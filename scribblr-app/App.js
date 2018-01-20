import React from 'react';
import { StyleSheet, Text, View, TextInput,
  TouchableHighlight, Modal, Button } from 'react-native';
import {
  StackNavigator,
} from 'react-navigation';

import JoinRoom from './JoinRoom'

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Welcome',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <Button
        title="Go to Jane's profile"
        onPress={() =>
          navigate('Profile', { name: 'Jane' })
        }
      />
    );
  }
}

const App = StackNavigator({
  JoinRoom: { screen: JoinRoom },
});

export default App;
