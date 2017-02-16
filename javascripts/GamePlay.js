import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
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
      isLoading: false
    };
  }

  _reactorWaitingForm() {
    return (
      <Text>reactor waiting form</Text>
    );
  }

  _scenarioSubmissionForm() {
    return (
      <Text>scenario submission form</Text>
    );
  }

  _scenarioListForm() {
    return (
      <Text>scenario list form</Text>
    );
  }

  render() {
    let responseForm;

    if (this.props.gameInfo.waitingForScenarios) {
      if (this.props.playerInfo.id == this.props.gameInfo.reactorID) {
        responseForm = this._reactorWaitingForm();
      }
      responseForm = this._scenarioSubmissionForm();
    } else {
      responseForm = this._scenarioListForm();
    }

    return (
      <ScrollView style={styles.main}>
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
            style={{width: WINDOW_WIDTH - 20, height: WINDOW_HEIGHT / 2}}
            resizeMode='contain'
            source={{uri: this.props.gameInfo.image}} />
        </View>


        {responseForm}


        <ErrorMessage errorMessage={this.props.errorMessage} />
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
    fontSize: 20,
    borderBottomWidth: 0,
    height: 36,
  },
  submitContainer: {
    padding: 10,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#eee',
    marginTop: 10,
  },
  submitText: {
    fontSize: 20,
    color: '#333',
  },
});
