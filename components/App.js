/* @flow */

import {AppLoading, FileSystem} from 'expo';
import {
  AppState,
  Platform,
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
import {registerPushNotificationsPromise} from '../libraries/permissions';
import {deleteGifCache, preloadGif} from '../libraries/preloading';
import Database from '../libraries/database';
import GamePlay from './GamePlay';
import GameOver from './GameOver';
import MessageBanner from './MessageBanner';
import NewGame from './NewGame';
import NewPlayer from './NewPlayer';
import LeaveGameConfirmation from './LeaveGameConfirmation';
import WaitingToStart from './WaitingToStart';

import type {GameInfo, PlayerInfo, ImageUrl} from '../flow/types';

const db = new Database();

type propTypes = {};
type stateTypes = {
  gameInfo: ?GameInfo,
  playerInfo: ?PlayerInfo,
  errorMessage: ?string,
  leaveGameConfirmationVisible: boolean,
  gameStatusBarVisible: boolean,
  appIsReady: boolean,
  imageCache: {[number]: string},
  lastImageIdCached: ?number,
  timeLeft: ?number,
  networkError: boolean,
  downloadResumables: {[number]: FileSystem.DownloadResumable},
  appState: ?string,
  pushToken: string | null,
};

export default class App extends React.Component<propTypes, stateTypes> {
  downloading: boolean;

  constructor(props: propTypes) {
    super(props);
    this.state = {
      gameInfo: null,
      playerInfo: null,
      errorMessage: null,
      leaveGameConfirmationVisible: false,
      gameStatusBarVisible: true,
      appIsReady: false,
      imageCache: {},
      lastImageIdCached: null,
      timeLeft: null,
      networkError: false,
      downloadResumables: {},
      appState: AppState.currentState,
      pushToken: null,
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

    // Save whether the app is in the foreground
    AppState.addEventListener('change', (nextAppState) => this.setState({appState: nextAppState}));

    // Start polling game info
    this._pollGameInfo();
    setInterval(this._pollGameInfo, 1000);

    // Set the countdown timer for waiting for responses
    setInterval(this._roundCountdown, 1000);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', (nextAppState) => this.setState({appState: nextAppState}));
  }

  _addToImageCache = (id: number, url: string) => {
    const newImageCache = this.state.imageCache;
    newImageCache[id] = url;
    this.setState({imageCache: newImageCache});
  }

  _dismissLeaveGame = () => {
    this.setState({leaveGameConfirmationVisible: false});
  };

  async _fillImageCachePromise(): Promise<void> {
    // Refresh the local image cache.
    // Prefetch if the image hasn't been saved.
    let gameInfo = this.state.gameInfo;

    if (gameInfo &&
      gameInfo.imageQueue &&
      gameInfo.imageQueue.length > 0 &&
      !this.downloading) {
      this.downloading = true;
      let imageCache = this.state.imageCache;
      let imageQueue = gameInfo.imageQueue.slice();

      for (let i = imageQueue.length - 1; i >= 0; i--) {
        const image = imageQueue[i];
        if (this.state.gameInfo && this.state.gameInfo.image &&
          image.id < this.state.gameInfo.image.id) {
            // This image is not needed anymore. Do not cache.
            continue
          }
        if (!imageCache.hasOwnProperty(image.id)) {

          const saveDownloadResumable = (
            downloadResumable: FileSystem.DownloadResumable
          ) => {
            const downloadResumables = this.state.downloadResumables;
            downloadResumables[image.id] = downloadResumable;
            this.setState({downloadResumables});
          };

          await preloadGif(image, gameInfo.id, this._addToImageCache, () => {}, saveDownloadResumable);
        }
      }

      this.setState({
        lastImageIdCached: imageQueue[0].id,
      });
      this.downloading = false;
    }
  }

  async _loadSavedState() {
    // Load saved state from sqlite database
    let savedVals;
    try {
      savedVals = await db.loadSavedStatePromise();
    } catch (err) {
      console.log(err);
      this.setState({
        errorMessage: 'Error processing saved data.',
        appIsReady: true,
      });
      return;
    }

    this.setState({
      gameInfo: savedVals != null && savedVals.gameInfo ? savedVals.gameInfo : null,
      playerInfo: savedVals != null && savedVals.playerInfo ? savedVals.playerInfo : null,
      errorMessage: savedVals != null && savedVals.errorMessage ? savedVals.errorMessage : null,
      pushToken: savedVals != null && savedVals.pushToken ? savedVals.pushToken : this.state.pushToken,
      imageCache: savedVals != null && savedVals.imageCache ? savedVals.imageCache : this.state.imageCache,
      leaveGameConfirmationVisible: false,
      appIsReady: true,
    });

    // Attempt to get a push notification token if one isn't saved.
    if (!savedVals || !savedVals.pushToken) {
      const pushToken = await registerPushNotificationsPromise();
      this.setState({pushToken});
    }

    Reporting.setSentryContext(this.state);
  }

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
        if (this.state.gameInfo && this.state.gameInfo.image && res.result.gameInfo.image &&
          this.state.gameInfo.image.id < res.result.gameInfo.image.id) {
          // New image
          this._pauseUnneededDownloads(res.result.gameInfo.image.id);
        }

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
          this._fillImageCachePromise();
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

  _onChangeGameStatusBarVisibility = isVisible => this.setState({gameStatusBarVisible: isVisible});

  _onChooseScenario = choiceID => {
    if (this.state.gameInfo) {
      return this._postToServer('chooseScenario',{choiceID: choiceID, round: this.state.gameInfo.round});
    }
    return new Promise((reject, resolve) => {});
  }

  _onCreateGame = () => this._postToServer('createNewGame');

  _onCreatePlayer = (nickname: string) => {
    return (this._postToServer('createPlayer', {
      nickname: nickname,
      pushToken: this.state.pushToken,
    }));
  };

  _onEndGame = () => this._postToServer('endGame');

  _onJoinGame = (gameCode: string) => this._postToServer('joinGame', {gameCode});

  _onLeaveGame = () => {
    // Function to actually leave the game.
    if (this.state.imageCache) {
      deleteGifCache(Object.values(this.state.imageCache));
    }
    this._postToServer('leaveGame');
    this.setState({appIsReady: false});
  };

  _onNextRound = () => this._postToServer('nextRound');

  _onPressLeaveGame = () => {
    // Display confirmation buttons.
    this.setState({leaveGameConfirmationVisible: true});
  };

  _onSkipImage = () => {
    const prevImage = this.state.gameInfo ? Object.assign({}, this.state.gameInfo.image) : null;
    let gameInfo = this.state.gameInfo;
    if (gameInfo && gameInfo.image && gameInfo.image.hasOwnProperty('url')) {
      gameInfo.image.url = '';
    }
    this.setState({gameInfo: gameInfo});
    return this._postToServer('skipImage', {image: prevImage});
  };

  _onStartGame = () => this._postToServer('startGame');

  _onSubmitResponse = (response: string) => {
    if (this.state.gameInfo) {
      return this._postToServer('submitResponse', {
        round: this.state.gameInfo.round,
        response: response,
      });
    }
    return new Promise((reject, resolve) => {});
  }

  _pauseUnneededDownloads = async (newImageId: number) => {
    // Pause image/video downloads that are older than the current one.
    const downloadResumables = this.state.downloadResumables;
    const imageIds = Object.keys(downloadResumables);

    for (let i = 0; i < imageIds.length; i++) {
      const imageId = parseInt(imageIds[i]);
      if (imageId < newImageId && !this.state.imageCache[imageId] && downloadResumables[imageId]) {
        try {
          await downloadResumables[imageId].pauseAsync();
          console.log(`Paused download of image ${imageId}`);
          delete downloadResumables[imageId];
          this.setState({downloadResumables});
        } catch(err) {
          // Image already done downloading or paused TODO how to check?
        }
      }
    }
  }

  _pollGameInfo = async () => {
    if (this.state.gameInfo !== null) {
      await this._postToServer('getGameInfo');
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

    let postData: Object = {gameID, playerID, action};
    Object.assign(postData, data);

    // Check if the app is active.
    if (this.state.appState === 'active') {
      postData.appIsActive = true;
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

    // If the player wanted to leave the game, reset everything.
    if (action == 'leaveGame') {
      this._resetState();
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
      downloadResumables: {},
      appIsReady: true,
    });
    this._saveState();
  }

  _roundCountdown = async () => {
    if (typeof this.state.timeLeft !== 'undefined' && this.state.timeLeft !== null) {
      this.setState({
        timeLeft: Math.max(this.state.timeLeft - 1000, 0),
      });
    }
  };

  _saveState() {
    // Save state to sqlite database
    db.updateSavedInfo('gameInfo', this.state.gameInfo);
    db.updateSavedInfo('playerInfo', this.state.playerInfo);
    db.updateSavedInfo('errorMessage', this.state.errorMessage);
    db.updateSavedInfo('pushToken', this.state.pushToken);
    db.updateSavedInfo('imageCache', this.state.imageCache);
    Reporting.setSentryContext(this.state);
  }

  _playArea = () => {
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
          testID="NewGame"
          onJoinGame={this._onJoinGame}
          onCreateGame={this._onCreateGame}
          errorMessage={this.state.errorMessage}
        />
      );
    }
    if (this.state.playerInfo == null) {
      return (
        <NewPlayer
          onCreatePlayer={this._onCreatePlayer}
          errorMessage={this.state.errorMessage}
        />
      );
    }
    const round = this.state.gameInfo.round;
    if (round != null) {
      return (
        <GamePlay
          onChooseScenario={this._onChooseScenario}
          onSubmitResponse={this._onSubmitResponse}
          onNextRound={this._onNextRound}
          onEndGame={this._onEndGame}
          onSkipImage={this._onSkipImage}
          gameInfo={this.state.gameInfo}
          imageCache={this.state.imageCache}
          playerInfo={this.state.playerInfo}
          errorMessage={this.state.errorMessage}
          timeLeft={this.state.timeLeft}
          onChangeGameStatusBarVisibility={this._onChangeGameStatusBarVisibility}
          addToImageCache={this._addToImageCache}
        />
      );
    }
    if (this.state.gameInfo.gameOver) {
      return (
        <GameOver
          onStartGame={this._onStartGame}
          gameInfo={this.state.gameInfo}
          playerInfo={this.state.playerInfo}
          errorMessage={this.state.errorMessage}
          imageCache={this.state.imageCache}
          addToImageCache={this._addToImageCache}
        />
      );
    }
    return (
      <WaitingToStart
        onStartGame={this._onStartGame}
        gameInfo={this.state.gameInfo}
        playerInfo={this.state.playerInfo}
        errorMessage={this.state.errorMessage}
      />
    );
  };

  render() {
    if (!this.state.appIsReady) {
      return (
        <AppLoading
          startAsync={async () => {} }
          onError={() => {}}
          onFinish={() => {}} />
      );
    }

    let leaveGameConfirmationLink;
    if (this.state.gameInfo || this.state.playerInfo) {
      leaveGameConfirmationLink = (
        <Button
          testID='LeaveGameButton'
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
          onPress={this._onPressLeaveGame}
        >
          Leave Game
        </Button>
      );
    }

    const playArea = this._playArea();
    const isNewGame = this.state.gameInfo === null;

    let timer;
    // Display the timer if the game status bar isn't visible.
    // Right now this only works for iOS.
    if (
      Platform.OS === 'ios' &&
      !this.state.gameStatusBarVisible &&
      this.state.gameInfo &&
      this.state.gameInfo.waitingForScenarios &&
      this.state.timeLeft !== null &&
      typeof this.state.timeLeft !== 'undefined'
    ) {
      timer = (
        <Text testID='TimeLeftTopBar' style={{fontSize: 16}}>
          {formatTime(this.state.timeLeft)}
        </Text>
      );
    }

    let messageBanner;
    if (this.state.networkError) {
      messageBanner = (
        <MessageBanner
          text='Please check your internet connection. My Reaction When may also be down.'
          title='Network Error'
          type='error'
        />
      );
    }

    return (
      <View style={styles.container}>
        <View style={isNewGame ? styles.headerLarge : styles.headerSmall}>
          <Image
            source={require('../images/mrw.png')}
            style={isNewGame ? styles.mrwLogoLarge : styles.mrwLogoSmall} />
          {timer}
          {leaveGameConfirmationLink}
        </View>
        <LeaveGameConfirmation
          dismissLeaveGame={this._dismissLeaveGame}
          leaveGameConfirmationVisible={this.state.leaveGameConfirmationVisible}
          onPressConfirmLeaveGame={this._onLeaveGame}
        />
        <View style={styles.playArea}>
          {playArea}
          {messageBanner}
        </View>
      </View>
    );
  }
}

function formatTime(ms: number): string {
  // ms is in milliseconds.
  // Returns a string in the xx:xx (mins:secs) format.
  // TODO move this out of the way.
  const mins = Math.floor(ms / 60000);
  let secs = Math.floor((ms - mins * 60000)/1000);
  if (secs <= 9) {
    secs = "0" + secs;
  }
  return '' + mins + ':' + secs;
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
