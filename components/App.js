/* @flow */

import {AppLoading} from 'expo';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Image,
} from 'react-native';
import Button from 'react-native-button';
import React from 'react';

import * as Reporting from '../libraries/reporting';
import {invalidState, postToServerPromise} from '../libraries/networking';
import {preloadGif} from '../libraries/preloading';
import Database from '../libraries/database';
import GamePlay from './GamePlay';
import GameOver from './GameOver';
import MessageBanner from './MessageBanner';
import NewGame from './NewGame';
import NewPlayer from './NewPlayer';
import Settings from './Settings';
import WaitingToStart from './WaitingToStart';

import type {GameInfo, PlayerInfo, ImageUrl} from '../flow/types';

const db = new Database();

type propTypes = {};
type stateTypes = {
  gameInfo: ?GameInfo,
  playerInfo: ?PlayerInfo,
  errorMessage: ?string,
  settingsVisible: boolean,
  appIsReady: boolean,
  imageCache: {[number]: string},
  lastImageIdCached: ?number,
  timeLeft: ?number,
  networkError: boolean,
};

export default class App extends React.Component<propTypes, stateTypes> {
  downloading: boolean;

  constructor(props: propTypes) {
    super(props);
    this.state = {
      gameInfo: null,
      playerInfo: null,
      errorMessage: null,
      settingsVisible: false,
      appIsReady: false,
      imageCache: {},
      lastImageIdCached: null,
      timeLeft: null,
      networkError: false,
    };
    this.downloading = false;
  }

  componentDidMount() {
    // Create the sqlite tables if they haven't been created.
    db.initializeTables(
      err => {
        console.log(err);
        this.setState({errorMessage: 'Error accessing database'});
      }
    );

    try {
      this._loadSavedState();
    } catch (err) {
      this.setState({appIsReady: true});
    }

    // Start polling game info
    this._pollGameInfo();
    setInterval(this._pollGameInfo, 1000);

    // Set the countdown timer for waiting for responses
    setInterval(this._roundCountdown, 1000);
  }

  _loadSavedState() {
    // Load saved state from sqlite database
    db.loadSavedState(
      (savedVals, err) => {
        if (err) {
          console.log(err);
          this.setState({
            errorMessage: 'Error processing saved data.',
            appIsReady: true,
          });
          return;
        }

        this.setState({
          gameInfo: savedVals != null && savedVals.hasOwnProperty('gameInfo') ? savedVals.gameInfo : null,
          playerInfo: savedVals != null && savedVals.hasOwnProperty('playerInfo') ? savedVals.playerInfo : null,
          errorMessage: savedVals != null && savedVals.hasOwnProperty('errorMessage') ? savedVals.errorMessage : null,
          settingsVisible: false,
          appIsReady: true,
        });

        Reporting.setSentryContext(this.state);
      }
    );
  }

  _saveState() {
    // Save state to sqlite database
    db.updateSavedInfo('gameInfo', this.state.gameInfo);
    db.updateSavedInfo('playerInfo', this.state.playerInfo);
    db.updateSavedInfo('errorMessage', this.state.errorMessage);
    Reporting.setSentryContext(this.state);
  }

  _setSettingsVisible = isVisible => {
    this.setState({settingsVisible: isVisible});
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
    const isNewGame = this.state.gameInfo === null;

    let messageBanner;
    if (this.state.networkError) {
      messageBanner = (
        <MessageBanner
          text='Please check your internet connection. My Reaction When may also be down.'
          title='Network Error'
          type='error' />
      );
    }

    return (
      <View style={styles.container}>
        <View style={isNewGame ? styles.headerLarge : styles.headerSmall}>
          <Image
            source={require('../images/mrw.png')}
            style={isNewGame ? styles.mrwLogoLarge : styles.mrwLogoSmall} />
          {settingsLink}
        </View>
        <Settings
          setSettingsVisible={this._setSettingsVisible}
          settingsVisible={this.state.settingsVisible}
          leaveGame={() => {this._postToServer('leaveGame')}} />
        <View style={styles.playArea}>
          {playArea}
          {messageBanner}
        </View>
      </View>
    );
  }

  async _fillImageCache(): Promise<void> {
    // Refresh the local image cache.
    // Prefetch if the image hasn't been saved.
    let gameInfo = this.state.gameInfo;

    if (gameInfo &&
      gameInfo.imageQueue &&
      gameInfo.imageQueue.length > 0 &&
      !this.downloading) {
      this.downloading = true;
      let imageCache = this.state.imageCache;
      let imageQueue = gameInfo.imageQueue;

      // TODO Promise.all
      for (let i = imageQueue.length - 1; i >= 0; i--) {
        const image = imageQueue[i];
        if (!imageCache.hasOwnProperty(image.id)) {
          imageCache[image.id] = await preloadGif(image);
        }
      }

      this.setState({
        imageCache: imageCache,
        lastImageIdCached: imageQueue[0].id,
      });
      this.downloading = false;
    }
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
        {choiceID, round});
      const submitResponse = (response: string) => this._postToServer(
        'submitResponse',
        {round, response});

      return (
        <GamePlay
          chooseScenario={chooseScenario}
          submitResponse={submitResponse}
          nextRound={() => this._postToServer('nextRound')}
          endGame={() => this._postToServer('endGame')}
          skipImage={() => {
            const prevImage = this.state.gameInfo ? this.state.gameInfo.image : null;
            let gameInfo = this.state.gameInfo;
            if (gameInfo && gameInfo.image && gameInfo.image.hasOwnProperty('url')) {
              gameInfo.image.url = '';
            }
            this.setState({gameInfo: gameInfo});
            return this._postToServer('skipImage', {image: prevImage});
          }}
          gameInfo={this.state.gameInfo}
          imageCache={this.state.imageCache}
          playerInfo={this.state.playerInfo}
          errorMessage={this.state.errorMessage}
          timeLeft={this.state.timeLeft} />
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

  _handleServerResponse = (action, res, postData) => {
    this.setState({
      networkError: false,
    });
    const errorMessage = res.errorMessage;
    if (errorMessage) {
      this.setState({errorMessage});
      Reporting.reportError(errorMessage, this.state);
    } else {
      // Check for an invalid state
      if (invalidState(res, action, postData, this.state.gameInfo, this.state.playerInfo)) {
        Reporting.captureMessage(
          'postToServer response invalid state: ' + action,
          this.state,
          action === 'leaveGame' ? 'info' : 'warning',
          Reporting.redactedRes(res)
        );
        return;
      }
      if (res.result && res.result.gameInfo) {
        const gameInfo = res.result.gameInfo;
        this.setState({gameInfo});

        // Update time left in round if applicable and over 2000 ms off
        const newTimeLeft = gameInfo.timeLeft;
        if (typeof newTimeLeft !== 'undefined' &&
          (typeof this.state.timeLeft === 'undefined' ||
            this.state.timeLeft === null ||
            Math.abs(this.state.timeLeft - newTimeLeft) > 2000)) {
          this.setState({
            timeLeft: newTimeLeft < 0 ? 0 : newTimeLeft
          });
        }

        const lastImageIdCached = this.state.lastImageIdCached;
        if (lastImageIdCached === null ||
          (gameInfo.imageQueue &&
            typeof lastImageIdCached !== 'undefined' &&
            gameInfo.imageQueue.length > 0 &&
            lastImageIdCached < gameInfo.imageQueue[0].id)) {
          this._fillImageCache();
        }
        this._saveState();
      }
      if (res.result && res.result.playerInfo) {
        this.setState({playerInfo: res.result.playerInfo});
        this._saveState();
      }
      if (action != 'getGameInfo') {
        this.setState({
          errorMessage: null
        });
      }
    }
  };

  _pollGameInfo = async () => {
    if (this.state.gameInfo !== null) {
      await this._postToServer('getGameInfo');
    }
  };

  _roundCountdown = async () => {
    if (typeof this.state.timeLeft !== 'undefined' && this.state.timeLeft !== null) {
      this.setState({
        timeLeft: Math.max(this.state.timeLeft - 1000, 0),
      });
    }
  };

  _postToServer = async (action, data) => {
    let playerID = (
      (this.state.playerInfo && this.state.playerInfo.hasOwnProperty('id'))
       ? this.state.playerInfo.id : null);
    let gameID = (
      (this.state.gameInfo && this.state.gameInfo.hasOwnProperty('id'))
      ? this.state.gameInfo.id : null);

    // Log actions
    Reporting.logAction(action, this.state);

    let postData = {gameID, playerID, action};
    Object.assign(postData, data);

    // If the player wanted to leave the game, reset everything.
    if (action == 'leaveGame') {
      this._resetState();
    }

    if (action == 'joinGame' || action == 'createNewGame') {
      this.setState({
        imageCache: {},
        lastImageIdCached: null,
      });
      this._saveState();
    }

    try {
      const res = await postToServerPromise(postData);
      this._handleServerResponse(action, res, postData);
    } catch(error) {
      console.log(error);
      this.setState({
        networkError: true,
      });
    }

  };

  _resetState = () => {
    this.setState({
      gameInfo: null,
      playerInfo: null,
      errorMessage: null,
      imageCache: {},
      lastImageIdCached: null,
      timeLeft: null,
    });
    this._saveState();
  }
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
