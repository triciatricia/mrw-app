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

  _getInstructions() {
    if (this.props.gameInfo.reactorID == this.props.playerInfo.id) {
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
        <Text style={{fontSize: 16, paddingTop: 10, paddingBottom: 10}}>
          Waiting for responses. Hold on tight!
        </Text>
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

        <Text style={{fontSize: 16, paddingTop: 10, paddingBottom: 10, color: 'green'}}>
          {helpMessage}
        </Text>
      </View>
    );
  }

  _scenarioListForm() {
    return (
      <Text>{this._getInstructions()}</Text>
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
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16}}>
                {this.props.playerInfo.nickname}
              </Text>
              <Text style={{fontSize: 16, paddingBottom: 10}}>
                Score: {this.props.playerInfo.score}
              </Text>
            </View>

            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <Text style={{fontSize: 16}}>
                Round: {this.props.gameInfo.round}
              </Text>
              <Text style={{fontSize: 16, paddingBottom: 10}}>
                Game Code: {this.props.gameInfo.id}
              </Text>
            </View>
          </View>

          <View style={{flex: 1}}>
            <Image
              style={{width: WINDOW_WIDTH - 20, height: WINDOW_HEIGHT / 2 - 60, marginBottom: 10}}
              resizeMode='contain'
              source={{uri: this.props.gameInfo.image}} />
          </View>

          <Text style={{fontSize: 16, paddingTop: 10, paddingBottom: 10}}>
            {this.props.gameInfo.reactorNickname}&#39;s response when...
          </Text>

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
});
