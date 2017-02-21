import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import Button from 'react-native-button';
import ParaText from './ParaText';
import ErrorMessage from './ErrorMessage';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const HEADER_HEIGHT = 70;

export default class GameOver extends React.Component {
  static propTypes = {
    gameInfo: React.PropTypes.object,
    playerInfo: React.PropTypes.object,
    startGame: React.PropTypes.func,
    errorMessage: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  _startGame = () => {
    this.setState({
      isLoading: true
    });
    this.props.startGame();
  }

  _renderScoreTable() {
    // Display scores in descending order with the top bold
    const scores = this.props.gameInfo.scores;
    let playersSorted = Object.keys(scores);
    playersSorted.sort((p1, p2) => (scores[p2] - scores[p1]));
    const highestScore = scores[playersSorted[0]];

    return playersSorted.map(
    player => {
      return (
        <ParaText
          key={player}
          style={{fontWeight: scores[player] == highestScore ? 'bold' : 'normal'}}
          >
          {scores[player]} {player}
        </ParaText>
      );
    });
  }

  render() {
    const rematchButton = (
      <Button
        id="rematchButton"
        containerStyle={styles.newGameContainer}
        style={styles.newGameText}
        onPress={this._startGame}>
        {this.state.isLoading && this.props.errorMessage == null ?
          'Loading...' :
          'Again!'}
      </Button>);
    return (
      <ScrollView style={styles.main}>
        <View style={{minHeight: WINDOW_HEIGHT - HEADER_HEIGHT, justifyContent: 'center'}}>
        <ParaText style={styles.h2Text}>And we&#39;re done!</ParaText>

        <View>{this._renderScoreTable()}</View>

        {rematchButton}

        <ErrorMessage
          errorMessage={this.props.errorMessage} />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 20,
  },
  h2Text: {
    fontSize: 40,
    color: '#333',
  },
  newGameContainer: {
    padding: 10,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#4472C4',
  },
  newGameText: {
    color: '#FFF',
    fontSize: 20,
  },
});
