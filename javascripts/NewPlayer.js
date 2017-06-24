import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  Keyboard,
} from 'react-native';
import Button from 'react-native-button';
import ErrorMessage from './ErrorMessage';

export default class NewPlayer extends React.Component {
  static propTypes = {
    gameInfo: React.PropTypes.object,
    playerInfo: React.PropTypes.object,
    createPlayer: React.PropTypes.func,
    errorMessage: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      nickname: ''
    };
  }

  render() {
    return (
      <View style={styles.main}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <View style={styles.inputView}>
            <TextInput
              style={styles.input}
              placeholder='What do you want to be called?'
              onChangeText={(text) => this.setState({nickname: text})}
              value={this.state.nickname}
              autoCorrect={false}
              autoCapitalize='words'
              maxLength={35}
              underlineColorAndroid='transparent' />
          </View>
          <Button
            containerStyle={styles.submitContainer}
            style={styles.submitText}
            onPress={() => {
              Keyboard.dismiss();
              this.props.createPlayer(this.state.nickname.trim());
            }} >
            Submit Nickname
          </Button>
          <ErrorMessage errorMessage={this.props.errorMessage} />
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
    padding: 20,
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
