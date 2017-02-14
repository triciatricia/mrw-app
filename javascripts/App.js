import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import NewGame from './NewGame';

const playAreas = {
  NewGame: NewGame
};

const getGameStage = (playerInfo, gameInfo) => {
  return 'NewGame';
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameInfo: null,
      playerInfo: null,
    };
  };

  render() {
    const gameStage = getGameStage(
      this.state.playerInfo,
      this.state.gameInfo
    );
    const PlayArea = playAreas[gameStage];
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../images/mrw.png')}
            style={styles.mrwLogo} />
          <Text>Info</Text>
          <Text>Settings</Text>
        </View>
        <View style={styles.playArea}>
          <PlayArea />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    height: 130,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mrwLogo: {
    width: 170,
    height: 100,
  },
  playArea: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
});
