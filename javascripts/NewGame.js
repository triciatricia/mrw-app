import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Button from 'react-native-button';
import ErrorMessage from './ErrorMessage';

export default class NewGame extends React.Component {
  static propTypes = {
    gameInfo: React.PropTypes.object,
    playerInfo: React.PropTypes.object,
    joinGame: React.PropTypes.func,
    createGame: React.PropTypes.func,
    errorMessage: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      gameCode: ''
    };
  }

  render() {
    const joinGameBackground = this.state.gameCode === '' ? '#eee' : '#4472C4';
    const joinGameTextColor = this.state.gameCode === '' ? '#333' : '#fff';
    const newGameBackground = this.state.gameCode === '' ? '#4472C4' : '#eee';
    const newGameTextColor = this.state.gameCode === '' ? '#fff' : '#333';

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.main}>
          <View style={{flex: 0.7, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={styles.h1Text}>Hello!</Text>
            <Text style={styles.pText}>Are you ready to react?</Text>
          </View>

          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={styles.inputView}>
              <TextInput
                style={styles.input}
                placeholder='Enter game code:'
                onChangeText={(text) => this.setState({gameCode: text})}
                value={this.state.gameCode}
                autoCorrect={false}
                autoCapitalize='characters'
                keyboardType={Platform.OS === 'android' ? 'numeric' : 'numbers-and-punctuation'}
                underlineColorAndroid='transparent' />
            </View>
            <Button
              containerStyle={[styles.joinGameContainer, {backgroundColor: joinGameBackground}]}
              style={[styles.joinGameText, {color: joinGameTextColor}]}
              onPress={() => {
                Keyboard.dismiss();
                this.props.joinGame(this.state.gameCode.trim());
              }} >
              Join an Existing Game
            </Button>
            <ErrorMessage errorMessage={this.props.errorMessage} />
          </View>

          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Button
              containerStyle={[styles.newGameContainer, {backgroundColor: newGameBackground}]}
              style={[styles.newGameText, {color: newGameTextColor}]}
              onPress={this.props.createGame} >
              + New Game
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 20,
  },
  h1Text: {
    fontSize: 60,
    color: '#333',
  },
  pText: {
    fontSize: 20,
    color: '#333',
  },
  inputView: {
    borderColor: '#999',
    borderBottomWidth: 1,
  },
  input: {
    color: '#999',
    fontSize: 26,
    borderBottomWidth: 0,
    height: 40,
  },
  joinGameContainer: {
    padding: 10,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#eee',
    marginTop: 10,
  },
  joinGameText: {
    fontSize: 20,
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
