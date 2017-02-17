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
import ParaText from './ParaText';
import ScenarioList from './ScenarioList';
import GameStatusBar from './GameStatusBar';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

export default class GamePlay extends React.Component {
  static propTypes = {
    gameInfo: React.PropTypes.object,
    playerInfo: React.PropTypes.object,
    submitResponse: React.PropTypes.func,
    chooseScenario: React.PropTypes.func,
    nextRound: React.PropTypes.func,
    endGame: React.PropTypes.func,
    skipImage: React.PropTypes.func,
    errorMessage: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      scenario: ''
    };
  }

  _isReactor() {
    return this.props.gameInfo.reactorID == this.props.playerInfo.id;
  }

  _getInstructions() {
    if (this._isReactor()) {
      return (
        this.props.gameInfo.winningResponse ?
          'Good choice!' : (this.props.playerInfo.nickname +
                            ', read this list out loud and pick your favorite!'));
    }
    return (
      this.props.gameInfo.winningResponse ?
        (this.props.gameInfo.reactorNickname + ' has chosen!') :
        (this.props.gameInfo.reactorNickname + ' is choosing their favorite scenario. Hold tight!'));
  }

  _reactorWaitingForm() {

    return (
      <View>
        <ParaText style={styles.boldText}>
          {this.props.gameInfo.reactorNickname}&#39;s response when...
        </ParaText>
        <ParaText>
          Waiting for responses. Hold on tight!
        </ParaText>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.buttonText}
          onPress={() => {}} >
          Skip Image
        </Button>
      </View>
    );
  }

  _scenarioSubmissionForm() {
    let buttonText = 'Submit Response';
    let helpMessage = '';
    let placeholder = 'Make up something';
    if (this.props.playerInfo.submittedScenario) {
      buttonText = 'Update Response';
      helpMessage = 'Your response is in!';
      placeholder = this.props.playerInfo.response;
    }

    return (
      <View>
        <ParaText style={styles.boldText}>
          {this.props.gameInfo.reactorNickname}&#39;s response when...
        </ParaText>
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
          containerStyle={styles.buttonContainer}
          style={styles.buttonText}
          onPress={() => {}} >
          {buttonText}
        </Button>

        <ParaText style={{color: 'green'}}>
          {helpMessage}
        </ParaText>
      </View>
    );
  }

  _scenarioListForm() {
    const buttons = (
      <View style={{flexDirection: 'row'}}>
        <Button
          containerStyle={[
            styles.buttonContainer,
            {backgroundColor: '#4472C4', marginRight: 10}]}
          style={[styles.buttonText, {color: '#fff'}]}
          onPress={() => {}} >
          Next
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.buttonText}
          onPress={() => {}} >
          End Game
        </Button>
      </View>
    );
    let waitMessage;
    if (this.props.gameInfo.winningResponse) {
      waitMessage = (
        <ParaText>
          Waiting for {this.props.gameInfo.reactorNickname} to go to the next round...
        </ParaText>
      );
    }
    return (
      <View>
        <ParaText>{this._getInstructions()}</ParaText>
        <ParaText style={styles.boldText}>
          {this.props.gameInfo.reactorNickname}&#39;s response when...
        </ParaText>
        <ScenarioList
          scenarios={this.props.gameInfo.choices}
          reactorNickname={this.props.gameInfo.reactorNickname}
          winningResponse={this.props.gameInfo.winningResponse}
          winningResponseSubmittedBy={this.props.gameInfo.winningResponseSubmittedBy}
          isReactor={this._isReactor()} />
        {this._isReactor() ? buttons : waitMessage}
      </View>
    );
  }

  render() {
    let responseForm;

    if (this.props.gameInfo.waitingForScenarios) {
      responseForm = (this.props.playerInfo.id == this.props.gameInfo.reactorID ?
        this._reactorWaitingForm() : this._scenarioSubmissionForm());
    } else {
      responseForm = this._scenarioListForm();
    }

    return (
      <ScrollView style={styles.main}>
        <KeyboardAvoidingView behavior='position' contentContainerStyle={{paddingBottom: 40}}>
          <GameStatusBar
            nickname={this.props.playerInfo.nickname}
            score={this.props.playerInfo.score}
            round={this.props.gameInfo.round}
            gameCode={this.props.gameInfo.id.toString()} />

          <View style={{flex: 1}}>
            <Image
              style={{width: WINDOW_WIDTH - 20, height: WINDOW_HEIGHT / 2 - 60, marginBottom: 20}}
              resizeMode='contain'
              source={{uri: this.props.gameInfo.image}} />
          </View>

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
