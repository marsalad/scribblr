import {
  StackNavigator,
} from 'react-navigation';

import JoinRoom from './JoinRoom'
import RoomControls from './RoomControls'

const App = StackNavigator({
  JoinRoom: { screen: JoinRoom },
  RoomControls: {screen: RoomControls}
});

export default App;
