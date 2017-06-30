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
import type { GameInfo, PlayerInfo } from './flow/types';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

class ScenarioListForm extends React.Component {
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
};

export default class GamePlay extends React.Component {
  props: propTypes;
  state: {
    scenario: string,
  };

  constructor(props: propTypes) {
    super(props);
    this.state = {
      scenario: ''
    };
  }

  _isReactor() {
    return this.props.gameInfo.reactorID == this.props.playerInfo.id;
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
          containerStyle={styles.buttonContainer}
          style={styles.buttonText}
          onPress={this.props.skipImage} >
          Skip Image
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

    if (this.props.playerInfo.score === null || this.props.gameInfo.round === null) {
      console.log('Error retrieving score or round.');
      return;
    }

    if (this.props.gameInfo.image === null) {
      console.log('Error retrieving gif url.');
      return;
    }

    const gif = (
      <Gif
        style={{ flex: 1, alignItems: 'stretch', justifyContent: 'center' }}
        width={ WINDOW_WIDTH - 40 }
        height={ WINDOW_HEIGHT / 2 - 60 }
        marginBottom={ 20 }
        sourceURI={ this.props.gameInfo.image } /> 
    );

    return (
      <ScrollView style={styles.main} keyboardShouldPersistTaps='handled'>
        <KeyboardAvoidingView behavior='position' contentContainerStyle={{paddingBottom: 40}}>
          <GameStatusBar
            nickname={this.props.playerInfo.nickname}
            score={this.props.playerInfo.score}
            round={this.props.gameInfo.round}
            gameCode={this.props.gameInfo.id.toString()} />

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
