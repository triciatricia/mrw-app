/* @flow */

import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from 'react-native-button';
import ErrorMessage from './ErrorMessage';
import type { GameInfo, PlayerInfo } from '../flow/types';

import FONTS from '../constants/fonts';

type propTypes = {
  gameInfo: GameInfo,
  playerInfo: PlayerInfo,
  onStartGame: () => Promise<void>,
  errorMessage: ?string,
};

type stateTypes = {
  isLoading: boolean,
};

export default class WaitingToStart extends React.Component<propTypes, stateTypes> {
  constructor(props: propTypes) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  _onStartGame = () => {
    this.setState({
      isLoading: true
    });
    this.props.onStartGame();
  };

  _isHost() {
    return this.props.gameInfo.hostID == this.props.playerInfo.id;
  }

  _nPlayers() {
    return Object.keys(this.props.gameInfo.scores).length;
  }

  render() {
    let button;
    if (this._isHost()) {
      button = (
        <Button
          containerStyle={styles.submitContainer}
          style={styles.submitText}
          onPress={this._onStartGame}>
          Start now!
        </Button>
      );
    }
    if (this.state.isLoading && this.props.errorMessage == null) {
      button = (
        <Button>
          Loading...
        </Button>
      );
    }
    const playersJoinedMessage = (this._nPlayers() + ' player' +
      (this._nPlayers() === 1 ? ' has' : 's have') + ' joined...');
    return (
      <View testID='WaitingToStart' style={styles.main}>
        <Text style={{fontSize: 40, paddingBottom: 10}}>
          Waiting to start!
        </Text>

        <Text style={{fontSize: 16}}>
          Ask your friends to join using this game code:
        </Text>

        <View style={{alignItems: 'center', paddingBottom: 10}}>
          <Text testID='GameCode' style={{
            fontSize: 22,
            color: '#4472C4',
            fontFamily: Platform.OS === 'android' ? FONTS.ANDROID_MONO : FONTS.IOS_MONO,
          }}>
            {this.props.gameInfo.id}
          </Text>
        </View>

        <Text testID='PlayersJoinedMessage' style={{fontSize: 16, color: '#666'}}>
          {playersJoinedMessage}
        </Text>

        {button}

        <ErrorMessage errorMessage={this.props.errorMessage} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 20,
  },
  inputView: {
    borderColor: '#999',
    borderBottomWidth: 1,
  },
  input: {
    color: '#999',
    fontSize: 20,
    borderBottomWidth: 0,
    height: 36,
  },
  submitContainer: {
    padding: 10,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#eee',
    marginTop: 10,
  },
  submitText: {
    fontSize: 20,
    color: '#333',
  },
});
