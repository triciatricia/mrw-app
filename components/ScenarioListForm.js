// The list of player-generated scenarios describing a gif.
// Display radio buttons, etc if the user is the reactor choosing their favorite scenario.
/* @flow */

import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from 'react-native-button';

import ErrorMessage from './ErrorMessage';
import ParaText from './ParaText';
import ScenarioList from './ScenarioList';

import type {GameInfo, PlayerInfo} from '../flow/types';

type propTypes = {
  gameInfo: GameInfo,
  playerInfo: PlayerInfo,
  errorMessage: ?string,
  onEndGame: () => Promise<void>,
  onNextRound: () => Promise<void>,
  onChooseScenario: (choiceID: string) => Promise<void>,
};

type stateTypes = {
  isLoading: boolean,
};

export default class ScenarioListForm extends React.Component<propTypes, stateTypes> {
  constructor(props: propTypes) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  _onEndGame = () => {
    this.props.onEndGame();
    this.setState({
      isLoading: true
    });
  };

  _onPressNextRound = () => {
    this.props.onNextRound();
    this.setState({
      isLoading: true
    });
  };

  _headerText = () => {
    return (
      <ParaText style={[styles.boldText, {fontSize: 20}]}>
        {this.props.gameInfo.reactorNickname}&#39;s reaction when...
      </ParaText>
    );
  };

  _instructions() {
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

  _isReactor() {
    return this.props.gameInfo.reactorID == this.props.playerInfo.id;
  }

  render() {
    let buttons;
    if (this.props.gameInfo.winningResponse != null) {
      buttons = (
        <View style={{flexDirection: 'row'}}>
          <Button
            testID='NextRoundButton'
            containerStyle={[
              styles.buttonContainer,
              {backgroundColor: '#4472C4', marginRight: 10}]}
            style={[styles.buttonText, {color: '#fff'}]}
            onPress={this._onPressNextRound}
          >
            Next
          </Button>
          <Button
            testID='EndGameButton'
            containerStyle={styles.buttonContainer}
            style={styles.buttonText}
            onPress={this._onEndGame}
          >
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
      <View testID='ScenarioListForm'>
        <ParaText>{this._instructions()}</ParaText>
        {this._headerText()}
        <ScenarioList
          scenarios={this.props.gameInfo.choices}
          reactorNickname={reactor}
          winningResponse={this.props.gameInfo.winningResponse}
          winningResponseSubmittedBy={this.props.gameInfo.winningResponseSubmittedBy}
          onChooseScenario={this.props.onChooseScenario}
          isReactor={this._isReactor()}
        />
        {this._isReactor() ? buttons : waitMessage}
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
