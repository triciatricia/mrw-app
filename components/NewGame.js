// Displays welcome message and interface for starting or joining a game.
/* @flow */

import React from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Button from 'react-native-button';

import ErrorMessage from './ErrorMessage';

import FONTS from '../constants/fonts';

type propTypes = {
  onJoinGame: (gameCode: string) => Promise<void>,
  onCreateGame: () => Promise<void>,
  errorMessage: ?string,
  testID: ?string,
};

type stateTypes = {
  gameCode: string,
};

export default class NewGame extends React.Component<propTypes, stateTypes> {
  constructor(props: propTypes) {
    super(props);
    this.state = {
      gameCode: '',
    };
  }

  render() {
    const joinGameBackground = this.state.gameCode === '' ? '#eee' : '#4472C4';
    const joinGameTextColor = this.state.gameCode === '' ? '#333' : '#fff';
    const newGameBackground = this.state.gameCode === '' ? '#4472C4' : '#eee';
    const newGameTextColor = this.state.gameCode === '' ? '#fff' : '#333';

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} testID={this.props.testID}>
        <View style={styles.main}>
          <View style={{flex: 0.7, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={styles.h1Text}>Hello!</Text>
            <Text style={styles.pText}>Are you ready to react?</Text>
          </View>

          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={styles.inputView}>
              <TextInput
                testID="GameCodeTextInput"
                style={styles.gameCodeInput}
                placeholder='Game Code'
                onChangeText={(text) => this.setState({gameCode: text})}
                value={this.state.gameCode}
                autoCorrect={false}
                autoCapitalize='characters'
                underlineColorAndroid='transparent'
              />
            </View>
            <Button
              testID="JoinGameButton"
              containerStyle={[styles.joinGameContainer, {backgroundColor: joinGameBackground}]}
              style={[styles.joinGameText, {color: joinGameTextColor}]}
              onPress={() => {
                Keyboard.dismiss();
                this.props.onJoinGame(this.state.gameCode.trim());
              }}
            >
              Join an Existing Game
            </Button>
            <ErrorMessage errorMessage={this.props.errorMessage} />
          </View>

          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Button
              testID="NewGameButton"
              containerStyle={[styles.newGameContainer, {backgroundColor: newGameBackground}]}
              style={[styles.newGameText, {color: newGameTextColor}]}
              onPress={this.props.onCreateGame}
            >
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
  gameCodeInput: {
    color: '#999',
    fontSize: 26,
    borderBottomWidth: 0,
    height: 40,
    fontFamily: Platform.OS === 'android' ? FONTS.ANDROID_MONO : FONTS.IOS_MONO,
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
