import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import NewGame from './NewGame';
import NewPlayer from './NewPlayer';
import WaitingToStart from './WaitingToStart';

const playAreas = {
  NewGame: NewGame,
  NewPlayer: NewPlayer,
  WaitingToStart: WaitingToStart,
};

const _getGameStage = (playerInfo, gameInfo) => {
  return 'WaitingToStart';
};

const _getPlayAreaProps = (gameStage) => {
  return {
    errorMessage: 'test',
    isHost: true,
    nPlayers: 2,
    gameCode: 'ABC123'
  };
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameInfo: null,
      playerInfo: null,
    };
  }

  render() {
    const gameStage = _getGameStage(
      this.state.playerInfo,
      this.state.gameInfo
    );
    const PlayArea = playAreas[gameStage];
    const props = _getPlayAreaProps(gameStage);
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
          <PlayArea {...props}/>
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
    height: 120,
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
