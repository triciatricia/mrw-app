import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
} from 'react-native';
import Button from 'react-native-button'

export default class NewGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameCode: ''
    };
  }

  render() {
    return (
      <View style={styles.main}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
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
            containerStyle={styles.joinGameContainer}
            style={styles.joinGameText}
            onPress={() => {}} >
            Join an Existing Game
          </Button>
        </View>

        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Button
            containerStyle={styles.newGameContainer}
            style={styles.newGameText}
            onPress={() => {}} >
            + New Game
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
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
