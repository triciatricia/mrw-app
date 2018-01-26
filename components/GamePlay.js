// The component that holds the game when it is being played (not waiting to start or finished).
/* @flow */

import React from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from 'react-native-button';
import ErrorMessage from './ErrorMessage';
import GameStatusBar from './GameStatusBar';
import Gif from './Gif';
import ParaText from './ParaText';
import ScenarioListForm from './ScenarioListForm';

import type {GameInfo, PlayerInfo} from '../flow/types';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;

type propTypes = {
  gameInfo: GameInfo,
  playerInfo: PlayerInfo,
  onSubmitResponse: (scenario: string) => Promise<void>,
  onChooseScenario: (choiceID: string) => Promise<void>,
  onNextRound: () => Promise<void>,
  onEndGame: () => Promise<void>,
  onSkipImage: () => Promise<void>,
  errorMessage: ?string,
  imageCache: {[number]: string},
  timeLeft: ?number,
  onChangeGameStatusBarVisibility: (isVisible: boolean) => void,
  addToImageCache: (id: number, url: string) => void,
};

type stateTypes = {
  scenario: string,
  loading: boolean,
  gameStatusBarVisible: boolean,
};

export default class GamePlay extends React.Component<propTypes, stateTypes> {
  constructor(props: propTypes) {
    super(props);
    this.state = {
      scenario: '',
      loading: false,
      gameStatusBarVisible: true,
    };
  }
  statusBar: ?View;

  componentWillReceiveProps(nextProps: propTypes) {
    if (nextProps.gameInfo.round != this.props.gameInfo.round) {
      this.setState({scenario: ''});
    }
    if (this.statusBar) {
      this.statusBar.measure((x, y, w, h, px, py) => {
        const isVisible = py >= 0;
        if (isVisible != this.state.gameStatusBarVisible) {
          this.props.onChangeGameStatusBarVisibility(py >= 0);
          this.setState({
            gameStatusBarVisible: isVisible,
          });
        }
      });
    }
  }

  componentDidUpdate(prevProps: propTypes) {
    if (prevProps.gameInfo.image &&
      this.props.gameInfo.image &&
      prevProps.gameInfo.image.id < this.props.gameInfo.image.id) {
      // Finished getting a new image url.
      this.setState({loading: false});
    }
  }

  _onPressSkipImage = () => {
    this.setState({
      loading: true,
    });
    this.props.onSkipImage();
  }

  _onSubmitResponse = () => {
    this.props.onSubmitResponse(this.state.scenario.trim());
  };

  _isReactor() {
    return this.props.gameInfo.reactorID == this.props.playerInfo.id;
  }

  _reactorWaitingForm() {
    return (
      <View>
        {this._renderHeaderText()}
        <ParaText>
          Waiting for responses. Hold on tight!
        </ParaText>
        <Button
          testID='SkipImageButton'
          containerStyle={[
            styles.buttonContainer,
            {backgroundColor: this.state.loading ? "#ffffff" : "#eeeeee"}
          ]}
          style={styles.buttonText}
          onPress={this._onPressSkipImage}
          disabled={this.state.loading}
        >
          {this.state.loading ? "Getting next image..." : "Skip Image"}
        </Button>
      </View>
    );
  }

  _renderHeaderText = () => {
    return (
      <ParaText style={[styles.boldText, {fontSize: 20}]}>
        {this.props.gameInfo.reactorNickname}&#39;s reaction when...
      </ParaText>
    );
  };

  _scenarioSubmissionForm() {
    if (
      typeof this.props.timeLeft !== 'undefined' &&
      this.props.timeLeft !== null &&
      this.props.timeLeft <= 0 &&
      this.props.gameInfo.responsesIn > 0
    ) {
      // Time is up for this round and at least one response is in.
      return <View><Text style={{fontSize: 18}}>Time&#39;s up! Gathering responses...</Text></View>;
    }

    let buttonText = 'Submit Response';
    let helpMessage = '';
    let placeholder = 'Make up something';
    if (this.props.playerInfo.submittedScenario) {
      buttonText = 'Update Response';
      helpMessage = 'Your response is in!';
      placeholder = this.props.playerInfo.response;
    }
    const responseChanged = (this.state.scenario.trim() === '' ||
      this.state.scenario.trim() === this.props.playerInfo.response);

    return (
      <View>
        {this._renderHeaderText()}
        <View style={styles.inputView}>
          <TextInput
            testID='ScenarioTextInput'
            style={styles.input}
            placeholder={placeholder}
            onChangeText={(text) => this.setState({scenario: text})}
            value={this.state.scenario}
            autoCapitalize='none'
            maxLength={500}
            underlineColorAndroid='transparent'
          />
        </View>

        <Button
          testID='ScenarioSubmissionButton'
          containerStyle={[styles.buttonContainer, {backgroundColor: responseChanged ? '#eee' : '#4472C4'}]}
          style={[styles.buttonText, {color: responseChanged ? '#333' : '#fff'}]}
          onPress={this._onSubmitResponse}
        >
          {buttonText}
        </Button>

        <ParaText testID='ScenarioHelpMessage' style={{color: 'green'}}>
          {helpMessage}
        </ParaText>
      </View>
    );
  }

  render() {
    let responseForm;

    if (this.props.gameInfo.waitingForScenarios) {
      responseForm = (this.props.playerInfo.id == this.props.gameInfo.reactorID ?
        this._reactorWaitingForm() : this._scenarioSubmissionForm());
    } else {
      responseForm = (
        <ScenarioListForm
          gameInfo={this.props.gameInfo}
          playerInfo={this.props.playerInfo}
          errorMessage={this.props.errorMessage}
          onEndGame={this.props.onEndGame}
          onNextRound={this.props.onNextRound}
          onChooseScenario={this.props.onChooseScenario}
        />
      );
    }

    if (this.props.gameInfo.image == null ||
      !this.props.gameInfo.image.hasOwnProperty('url')) {
      console.log('Error retrieving gif url.');
      return <ErrorMessage errorMessage={'Error retrieving gif url.'} />;
    }

    let gifSource = Object.assign({}, this.props.gameInfo.image);
    if (this.props.imageCache.hasOwnProperty(gifSource.id)) {
      // TODO Can we assume the OS has not deleted the downloded image?
      gifSource.localUri = this.props.imageCache[gifSource.id];
      gifSource.prefetched = true;
    }

    if (this.props.playerInfo.score === null || this.props.gameInfo.round === null) {
      console.log('Error retrieving score or round.');
      return <ErrorMessage errorMessage={'Error retrieving score or round.'} />;
    }

    const gif = (
      <Gif
        style={{flex: 1, alignItems: 'stretch', justifyContent: 'center'}}
        width={WINDOW_WIDTH - 40}
        height={WINDOW_HEIGHT / 2 - 90}
        marginBottom={20}
        source={gifSource}
        gameID={this.props.gameInfo.id}
        addToImageCache={this.props.addToImageCache}
      />
    );

    return (
      <ScrollView testID='GamePlay' style={styles.main} keyboardShouldPersistTaps='handled'>
        <KeyboardAvoidingView
          behavior='position'
          contentContainerStyle={{paddingBottom: 40}}
        >
          <View ref={v => {this.statusBar = v;}}>
            <GameStatusBar
              nickname={this.props.playerInfo.nickname}
              score={this.props.playerInfo.score}
              round={this.props.gameInfo.round}
              gameCode={this.props.gameInfo.id.toString()}
              waitingForScenarios={this.props.gameInfo.waitingForScenarios}
              timeLeft={this.props.timeLeft}
              responsesIn={this.props.gameInfo.responsesIn}
            />
          </View>

          {gif}

          {responseForm}

          <ErrorMessage errorMessage={this.props.errorMessage} />
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 20,
  },
  inputView: {
    borderColor: '#999',
    borderBottomWidth: 1,
  },
  input: {
    color: '#999',
    fontSize: 16,
    borderBottomWidth: 0,
    height: 30,
  },
  buttonContainer: {
    padding: 10,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#eee',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  }
});
