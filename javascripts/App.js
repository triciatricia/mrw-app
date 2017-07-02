/* @flow */

import React from 'react';
import {SQLite, AppLoading} from 'expo';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Image,
} from 'react-native';
import Sentry from 'sentry-expo';
import NewGame from './NewGame';
import NewPlayer from './NewPlayer';
import WaitingToStart from './WaitingToStart';
import GamePlay from './GamePlay';
import GameOver from './GameOver';
import networking from './networking';
import Settings from './Settings';
import Button from 'react-native-button';
import type { GameInfo, PlayerInfo } from './flow/types';

const db = SQLite.openDatabase('db.db');

type propTypes = {};

export default class App extends React.Component {
  props: propTypes;
  state: {
    gameInfo: ?GameInfo,
    playerInfo: ?PlayerInfo,
    errorMessage: ?string,
    settingsVisible: boolean,
    appIsReady: boolean,
  }
  constructor(props: propTypes) {
    super(props);
    this.state = {
      gameInfo: null,
      playerInfo: null,
      errorMessage: null,
      settingsVisible: false,
      appIsReady: false,
    };
  }

  componentDidMount() {
    // Create the sqlite tables if they haven't been created.
    db.transaction(
      tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS info (key TEXT PRIMARY KEY, value TEXT);',
          [],
          (tx, res) => {
            tx.executeSql(
              'INSERT OR IGNORE INTO info VALUES ("gameInfo", null), ("playerInfo", null), ("errorMessage", null);'
            );
          },
          (tx, err) => {
            console.log(err);
            this.setState({errorMessage: 'Error accessing database'});
          });
      },
      err => console.log(err));

    try {
      this._loadSavedState();
    } catch (err) {
      this.setState({appIsReady: true});
    }

    // Start polling game info
    this._pollGameInfo();
    setInterval(this._pollGameInfo, 1000);
  }

  _loadSavedState() {
    // Load saved state from sqlite database
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM info',
          [],
          (tx, res) => {
            let savedVals = {}
            try {
              for (const row in res.rows._array) {
                savedVals[res.rows._array[row].key] = JSON.parse(res.rows._array[row].value);
              }
            } catch (err) {
              console.log('Error processing saved data.');
              console.log(err);
              this.setState({
                errorMessage: 'Error processing saved data.',
                appIsReady: true,
              });
              return;
            }

            console.log('Loading saved state');
            console.log(savedVals);

            this.setState({
              gameInfo: savedVals.hasOwnProperty('gameInfo') ? savedVals.gameInfo : null,
              playerInfo: savedVals.hasOwnProperty('playerInfo') ? savedVals.playerInfo : null,
              errorMessage: savedVals.hasOwnProperty('errorMessage') ? savedVals.errorMessage : null,
              settingsVisible: false,
              appIsReady: true,
            });

            this._setSentryContext();
          },
          (tx, err) => {
            console.log('No saved state.');
            this.setState({appIsReady: true});
          }
        );
    },
    err => {
      console.log(err);
      this.setState({appIsReady: true});
    });
  }

  _saveState() {
    // Save state to sqlite database
    this._updateSavedInfo('gameInfo', this.state.gameInfo);
    this._updateSavedInfo('playerInfo', this.state.playerInfo);
    this._updateSavedInfo('errorMessage', this.state.errorMessage);
    this._setSentryContext();
  }

  _updateSavedInfo(key, value) {
    db.transaction(
      tx => {
        tx.executeSql(
          'UPDATE info SET value=? WHERE key=?',
          [JSON.stringify(value), key],
          (tx, res) => {},
          (tx, err) => {console.log('Error saving state.')});
      });
  }

  _setSettingsVisible(isVisible) {
    this.setState({settingsVisible: isVisible});
  }

  _redactPlayerInfo() {
    // Remove the response.
    let redactedPlayerInfo = Object.assign({}, this.state.playerInfo);
    if (redactedPlayerInfo.hasOwnProperty('response') && redactedPlayerInfo.response) {
      redactedPlayerInfo.response = 'hidden';
    }
    return redactedPlayerInfo;
  }

  _redactGameInfo() {
    // Remove choices
    let redactedGameInfo = Object.assign({}, this.state.gameInfo);

    if (this.state.gameInfo && redactedGameInfo.hasOwnProperty('choices') && redactedGameInfo.choices) {
      redactedGameInfo.choices = Object.assign({}, this.state.gameInfo.choices);
      for (let i in redactedGameInfo.choices) {
        redactedGameInfo.choices[i] = 'hidden';
      }
    }

    return redactedGameInfo;
  }

  _redactedStateData() {
    return {
      playerInfo: this._redactPlayerInfo(),
      gameInfo: this._redactGameInfo(),
      errorMessage: this.state.errorMessage,
      settingsVisible: this.state.settingsVisible
    };
  }

  _setSentryContext() {
    Sentry.setUserContext({
      id: this.state.playerInfo && this.state.playerInfo.hasOwnProperty('id') ? this.state.playerInfo.id : null
    });
    Sentry.setExtraContext(this._redactedStateData());
  }

  render() {
    if (!this.state.appIsReady) {
      return <AppLoading />;
    }

    let settingsLink;
    if (this.state.gameInfo || this.state.playerInfo) {
      settingsLink = (
        <Button
          containerStyle={{
            padding: 6,
            overflow: 'hidden',
            borderRadius: 8,
            backgroundColor: '#fff',
            width: 120,
            height: 30,
          }}
          style={{
            fontSize: 14,
            color: '#333',
          }}
          onPress={() => {
            this._setSettingsVisible(true)
          }} >
          Leave Game
        </Button>
      );
    }

    const playArea = this._getPlayArea();
    const isNewGame = playArea instanceof NewGame;

    return (
      <View style={styles.container}>
        <View style={isNewGame ? styles.headerLarge : styles.headerSmall}>
          <Image
            source={require('../images/mrw.png')}
            style={isNewGame ? styles.mrwLogoLarge : styles.mrwLogoSmall} />
          {settingsLink}
        </View>
        <Settings
          setSettingsVisible={(visible) => {this._setSettingsVisible(visible)}}
          settingsVisible={this.state.settingsVisible}
          leaveGame={() => {this._postToServer('leaveGame')}} />
        <View style={styles.playArea}>
          {playArea}
        </View>
      </View>
    );
  }

  _getPlayArea = () => {
    const gameInfo = this.state.gameInfo;
    const playerInfo = this.state.playerInfo;
    const errorMessage = this.state.errorMessage;
    const sharedProps = {
      gameInfo: this.state.gameInfo,
      playerInfo: this.state.playerInfo,
      errorMessage: this.state.errorMessage,
    };

    if (this.state.gameInfo == null) {
      return (
        <NewGame
          joinGame={(gameCode: string) => this._postToServer('joinGame', {gameCode})}
          createGame={() => this._postToServer('createNewGame')}
          errorMessage={this.state.errorMessage} />
      );
    }
    if (this.state.playerInfo == null) {
      return (
        <NewPlayer
          createPlayer={
            (nickname: string) => this._postToServer('createPlayer', {nickname})
          }
          errorMessage={this.state.errorMessage} />
      );
    }
    const round = this.state.gameInfo.round;
    if (round != null) {
      const chooseScenario = (choiceID) => this._postToServer(
        'chooseScenario',
        { choiceID, round });
      const submitResponse = (response: string) => this._postToServer(
        'submitResponse',
        { round, response });

      return (
        <GamePlay
          chooseScenario={chooseScenario}
          submitResponse={submitResponse}
          nextRound={() => this._postToServer('nextRound')}
          endGame={() => this._postToServer('endGame')}
          skipImage={() => this._postToServer('skipImage')}
          gameInfo={this.state.gameInfo}
          playerInfo={this.state.playerInfo}
          errorMessage={this.state.errorMessage} />
      );
    }
    if (this.state.gameInfo.gameOver) {
      return (
        <GameOver
          startGame={() => this._postToServer('startGame')}
          gameInfo={this.state.gameInfo}
          playerInfo={this.state.playerInfo}
          errorMessage={this.state.errorMessage} />
      );
    }
    return (
      <WaitingToStart
        startGame={() => this._postToServer('startGame')}
        gameInfo={this.state.gameInfo}
        playerInfo={this.state.playerInfo}
        errorMessage={this.state.errorMessage} />
    );
  };

  _pollGameInfo = async () => {
    if (this.state.gameInfo !== null) {
      await this._postToServer('getGameInfo');
    }
  };

  _postToServer = async (action, data) => {
    try {
      let playerID = (
        (this.state.playerInfo && this.state.playerInfo.hasOwnProperty('id'))
         ? this.state.playerInfo.id : null);
      let gameID = (
        (this.state.gameInfo && this.state.gameInfo.hasOwnProperty('id'))
        ? this.state.gameInfo.id : null);

      // Log actions
      if (action === 'submitResponse' || action === 'joinGame' || action === 'leaveGame') {
        this._setSentryContext();
        Sentry.captureMessage('postToServer action: ' + action, {
          level: 'info',
          tags: {type: 'postToServer_action'}
        });
      } else if (action !== 'getGameInfo') {
        this._setSentryContext();
        Sentry.captureBreadcrumb({
          message: 'postToServer action: ' + action,
          category: 'action',
          data: this._redactedStateData()
        });
      }

      let postData = {};
      Object.assign(postData, {
        gameID: gameID,
        playerID: playerID,
        action: action,
      });
      Object.assign(postData, data);

      // If the player wanted to leave the game, reset everything.
      if (action == 'leaveGame') {
        this.setState({
          gameInfo: null,
          playerInfo: null,
          errorMessage: null
        });
        this._saveState();
      }

      const res = await networking.postToServer(postData);

      if (res.errorMessage) {
        this.setState({
          errorMessage: res.errorMessage
        });
        this._setSentryContext();
        Sentry.captureMessage('Error message set: ' + res.errorMessage, {
          level: 'info'
        });
      } else {
        // Check for an invalid state
        if (this._invalidState(res, action)) {
          this._setSentryContext();
          Sentry.captureMessage('postToServer response invalid state: ' + action, {
            level: action === 'leaveGame' ? 'info' : 'warning',
            extra: res
          });
          return;
        }
        if (res.result.hasOwnProperty('gameInfo') && res.result.gameInfo) {
          this.setState({gameInfo: res.result.gameInfo});
          this._saveState();
        }
        if (res.result.hasOwnProperty('playerInfo') && res.result.playerInfo) {
          this.setState({playerInfo: res.result.playerInfo});
          this._saveState();
        }
        if (action != 'getGameInfo') {
          this.setState({
            errorMessage: null
          });
        }
      }
    } catch(error) {
      console.log(error);
      this.setState({
        errorMessage: 'Error communicating to server'
      });
    }
  };

  // Compare the result from a network message to current state
  _invalidState = (res, action) => {
    if (!res.hasOwnProperty('result')) {
      return true;
    }
    const gameInfo = this.state.gameInfo;
    const playerInfo = this.state.playerInfo;
    if (
      action != 'leaveGame' &&
      res.hasOwnProperty('result') &&
      res.result.gameInfo &&
      gameInfo != null &&
      gameInfo.hasOwnProperty('id') &&
      (!res.result.gameInfo.hasOwnProperty('id') ||
       res.result.gameInfo.id != gameInfo.id)
    ) {
      return true;
    }
    if (res.hasOwnProperty('result') && res.result.hasOwnProperty('playerInfo') &&
        playerInfo != null && playerInfo.hasOwnProperty('id') &&
        action != 'logOut' && action != 'leaveGame' && res.result.playerInfo != null) {
      if (!res.result.playerInfo.hasOwnProperty('id') || res.result.playerInfo.id != playerInfo.id) {
        return true;
      }
    }
    if (res.hasOwnProperty('result') && gameInfo == null && res.result.gameInfo &&
        action != 'joinGame' && action != 'createNewGame') {
      return true;
    }
    return false;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  headerLarge: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mrwLogoLarge: {
    width: 170,
    height: 100,
  },
  headerSmall: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 45,
    paddingBottom: 20,
    alignItems: 'center',
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee',
  },
  mrwLogoSmall: {
    width: 85,
    height: 50,
  },
  playArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
