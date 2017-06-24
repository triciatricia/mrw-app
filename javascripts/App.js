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

const playAreas = {NewGame, NewPlayer, WaitingToStart, GamePlay, GameOver};

const db = SQLite.openDatabase('db.db');

export default class App extends React.Component {
  constructor(props) {
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
              for (row in res.rows._array) {
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

    if (redactedGameInfo.hasOwnProperty('choices') && redactedGameInfo.choices) {
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

  _getPlayAreaProps(gameStage) {
    let props = {
      gameInfo: this.state.gameInfo,
      playerInfo: this.state.playerInfo,
      errorMessage: this.state.errorMessage
    };
    switch (gameStage) {
      case 'NewGame':
        props.joinGame = (gameCode) => this._postToServer('joinGame', {gameCode});
        props.createGame = () => this._postToServer('createNewGame');
      case 'NewPlayer':
        props.createPlayer = (nickname) => this._postToServer('createPlayer', {nickname});
      case 'WaitingToStart':
        props.startGame = () => this._postToServer('startGame');
      case 'GamePlay':
        props.submitResponse = (response) => this._postToServer(
          'submitResponse',
          {
            round: this.state.gameInfo.round,
            response: response
          });
        props.chooseScenario = (choiceID) => this._postToServer(
          'chooseScenario',
          {
            choiceID: choiceID,
            round: this.state.gameInfo.round
          });
        props.nextRound = () => this._postToServer('nextRound');
        props.endGame = () => this._postToServer('endGame');
        props.skipImage = () => this._postToServer('skipImage');
      case 'GameOver':
        props.startGame = () => this._postToServer('startGame');
    }
    return props;
  }

  render() {
    if (!this.state.appIsReady) {
      return <AppLoading />;
    }

    const gameStage = this._gameStage();
    const PlayArea = playAreas[gameStage];
    const props = this._getPlayAreaProps(gameStage);

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

    return (
        <View style={styles.container}>
          <View style={gameStage == 'NewGame' ? styles.headerLarge : styles.headerSmall}>
            <Image
              source={require('../images/mrw.png')}
              style={gameStage == 'NewGame' ? styles.mrwLogoLarge : styles.mrwLogoSmall} />
            {settingsLink}
          </View>
          <Settings
            setSettingsVisible={(visible) => {this._setSettingsVisible(visible)}}
            settingsVisible={this.state.settingsVisible}
            leaveGame={() => {this._postToServer('leaveGame')}} />
          <View style={styles.playArea}>
            <PlayArea {...props}/>
          </View>
        </View>
    );
  }

  _gameStage = () => {
    if (this.state.gameInfo == null) {
      return 'NewGame';
    }
    if (this.state.playerInfo == null) {
      return 'NewPlayer';
    }
    if (this.state.gameInfo.round) {
      return 'GamePlay';
    }
    if (this.state.gameInfo.gameOver) {
      return 'GameOver';
    }
    return 'WaitingToStart';
  };

  _pollGameInfo = async () => {
    await this._postToServer('getGameInfo');
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

      const res = await networking.postToServer(Object.assign({
        gameID: gameID,
        playerID: playerID,
        action: action,
      }, data));
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
        // If the player wanted to leave the game, reset everything.
        if (action == 'leaveGame') {
          this.setState({
            gameInfo: null,
            playerInfo: null,
            errorMessage: null
          });
          this._saveState();
          return;
        }
        if (res.result.gameInfo) {
          this.setState({gameInfo: res.result.gameInfo});
          this._saveState();
        }
        if (res.result.playerInfo) {
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
      this.setState({
        errorMesage: 'Error communicating to server'
      });
    }
  };

  // Compare the result from a network message to current state
  _invalidState = (res, action) => {
    if (res.hasOwnProperty('result') && this.state.gameInfo && this.state.gameInfo.hasOwnProperty('id') && action != 'leaveGame') {
      if (!res.result.gameInfo.hasOwnProperty('id') || res.result.gameInfo.id != this.state.gameInfo.id) {
        return true;
      }
    }
    if (res.hasOwnProperty('result') && res.result.hasOwnProperty('playerInfo') &&
        this.state.playerInfo && this.state.playerInfo.hasOwnProperty('id') &&
        action != 'logOut' && action != 'leaveGame') {
      if (!res.result.playerInfo.hasOwnProperty('id') || res.result.playerInfo.id != this.state.playerInfo.id) {
        return true;
      }
    }
    if (res.hasOwnProperty('result') && this.state.gameInfo == null && res.result.gameInfo &&
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
