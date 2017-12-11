/* @flow */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import Button from 'react-native-button';
import ErrorMessage from './ErrorMessage';
import Gif from './Gif';
import ParaText from './ParaText';
import ScenarioList from './ScenarioList';
import GameStatusBar from './GameStatusBar';
import type {GameInfo, PlayerInfo} from '../flow/types';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;

type scenarioPropTypes = {
  gameInfo: GameInfo,
  playerInfo: PlayerInfo,
  errorMessage: ?string,
  endGame: () => Promise<void>,
  nextRound: () => Promise<void>,
  chooseScenario: (choiceID: string) => Promise<void>,
};

type scenarioStateTypes = {
  isLoading: boolean,
};

class ScenarioListForm extends React.Component<scenarioPropTypes, scenarioStateTypes> {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  _isReactor() {
    return this.props.gameInfo.reactorID == this.props.playerInfo.id;
  }

  _nextRound = () => {
    this.props.nextRound();
    this.setState({
      isLoading: true
    });
  };

  _getInstructions() {
    const reactor = (this.props.gameInfo.reactorNickname ?
      this.props.gameInfo.reactorNickname : 'The reactor');

    if (this._isReactor()) {
      return (
        this.props.gameInfo.winningResponse ?
          'Good choice!' : (reactor +
                            ', read this list out loud and pick your favorite!'));
    }

    return (
      this.props.gameInfo.winningResponse ?
        (reactor + ' has chosen!') :
        (reactor + ' is choosing their favorite scenario. Hold tight!'));
  }

  _renderHeaderText = () => {
    return (
      <ParaText style={[styles.boldText, {fontSize: 20}]}>
        {this.props.gameInfo.reactorNickname}&#39;s reaction when...
      </ParaText>
    );
  };

  _endGame = () => {
    this.props.endGame();
    this.setState({
      isLoading: true
    });
  };

  render() {
    let buttons;
    if (this.props.gameInfo.winningResponse != null) {
      buttons = (
        <View style={{flexDirection: 'row'}}>
          <Button
            containerStyle={[
              styles.buttonContainer,
              {backgroundColor: '#4472C4', marginRight: 10}]}
            style={[styles.buttonText, {color: '#fff'}]}
            onPress={this._nextRound} >
            Next
          </Button>
          <Button
            containerStyle={styles.buttonContainer}
            style={styles.buttonText}
            onPress={this._endGame} >
            End Game
          </Button>
        </View>
      );
      if (this.state.isLoading && this.props.errorMessage == null) {
        buttons = <Button>Loading...</Button>;
      }
    }

    let waitMessage;
    if (this.props.gameInfo.winningResponse) {
      waitMessage = (
        <ParaText>
          Waiting for {this.props.gameInfo.reactorNickname} to go to the next round...
        </ParaText>
      );
    }

    const reactor = this.props.gameInfo.reactorNickname == null ? 'The reactor' : this.props.gameInfo.reactorNickname;

    return (
      <View>
        <ParaText>{this._getInstructions()}</ParaText>
        {this._renderHeaderText()}
        <ScenarioList
          scenarios={this.props.gameInfo.choices}
          reactorNickname={reactor}
          winningResponse={this.props.gameInfo.winningResponse}
          winningResponseSubmittedBy={this.props.gameInfo.winningResponseSubmittedBy}
          chooseScenario={this.props.chooseScenario}
          isReactor={this._isReactor()} />
        {this._isReactor() ? buttons : waitMessage}
      </View>
    );
  }
}

type propTypes = {
  gameInfo: GameInfo,
  playerInfo: PlayerInfo,
  submitResponse: (scenario: string) => Promise<void>,
  chooseScenario: (choiceID: string) => Promise<void>,
  nextRound: () => Promise<void>,
  endGame: () => Promise<void>,
  skipImage: () => Promise<void>,
  errorMessage: ?string,
  imageCache: {[number]: string},
  timeLeft: ?number,
};

type stateTypes = {
  scenario: string,
  loading: boolean,
};

export default class GamePlay extends React.Component<propTypes, stateTypes> {
  constructor(props: propTypes) {
    super(props);
    this.state = {
      scenario: '',
      loading: false,
    };
  }

  componentDidUpdate(prevProps: propTypes) {
    if (prevProps.gameInfo.image &&
      this.props.gameInfo.image &&
      prevProps.gameInfo.image.id < this.props.gameInfo.image.id) {
      // Finished getting a new image url.
      this.setState({loading: false});
    }
  }

  _isReactor() {
    return this.props.gameInfo.reactorID == this.props.playerInfo.id;
  }

  _skipImage = () => {
    this.setState({
      loading: true,
    });
    this.props.skipImage();
  }

  _renderHeaderText = () => {
    return (
      <ParaText style={[styles.boldText, {fontSize: 20}]}>
        {this.props.gameInfo.reactorNickname}&#39;s reaction when...
      </ParaText>
    );
  };

  _reactorWaitingForm() {
    return (
      <View>
        {this._renderHeaderText()}
        <ParaText>
          Waiting for responses. Hold on tight!
        </ParaText>
        <Button
          containerStyle={[
            styles.buttonContainer,
            {backgroundColor: this.state.loading ? "#ffffff" : "#eeeeee"}
          ]}
          style={styles.buttonText}
          onPress={this._skipImage}
          disabled={this.state.loading} >
          {this.state.loading ? "Getting next image..." : "Skip Image"}
        </Button>
      </View>
    );
  }

  _submitResponse = () => {
    this.props.submitResponse(this.state.scenario);
    this.setState({
      scenario: ''
    });
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
            style={styles.input}
            placeholder={placeholder}
            onChangeText={(text) => this.setState({scenario: text})}
            value={this.state.scenario}
            autoCapitalize='none'
            maxLength={500}
            underlineColorAndroid='transparent' />
        </View>

        <Button
          containerStyle={[styles.buttonContainer, {backgroundColor: responseChanged ? '#eee' : '#4472C4'}]}
          style={[styles.buttonText, {color: responseChanged ? '#333' : '#fff'}]}
          onPress={this._submitResponse} >
          {buttonText}
        </Button>

        <ParaText style={{color: 'green'}}>
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
      responseForm = <ScenarioListForm
        gameInfo={this.props.gameInfo}
        playerInfo={this.props.playerInfo}
        errorMessage={this.props.errorMessage}
        endGame={this.props.endGame}
        nextRound={this.props.nextRound}
        chooseScenario={this.props.chooseScenario} />;
    }

    if (this.props.gameInfo.image == null ||
      !this.props.gameInfo.image.hasOwnProperty('url')) {
      console.log('Error retrieving gif url.');
      return <ErrorMessage errorMessage={'Error retrieving gif url.'} />;
    }

    let gifSource = this.props.gameInfo.image;
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
        height={WINDOW_HEIGHT / 2 - 60}
        marginBottom={20}
        source={gifSource} />
    );

    return (
      <ScrollView style={styles.main} keyboardShouldPersistTaps='handled'>
        <KeyboardAvoidingView behavior='position' contentContainerStyle={{paddingBottom: 40}}>
          <GameStatusBar
            nickname={this.props.playerInfo.nickname}
            score={this.props.playerInfo.score}
            round={this.props.gameInfo.round}
            gameCode={this.props.gameInfo.id.toString()}
            waitingForScenarios={this.props.gameInfo.waitingForScenarios}
            timeLeft={this.props.timeLeft}
            responsesIn={this.props.gameInfo.responsesIn} />

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
