import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native';
import Button from 'react-native-button';
import ErrorMessage from './ErrorMessage';

export default class WaitingToStart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  render() {
    let button;
    if (this.props.isHost) {
      button = (
        <Button
          containerStyle={styles.submitContainer}
          style={styles.submitText}
          onPress={() => {}}>
          Start now!
        </Button>
      );
    }
    if (this.state.isLoading && this.props.errorMessage == null) {
      button = (
        <Button
          containerStyle={styles.submitDisabledContainer}
          style={styles.submitDisabledText}
          onPress={() => {}}>
          Loading...
        </Button>
      );
    }
    return (
      <View style={styles.main}>
        <Text style={{fontSize: 40, paddingBottom: 10}}>
          Waiting to start!
        </Text>

        <Text style={{fontSize: 16}}>
          Ask your friends to join using this game code:
        </Text>

        <View style={{alignItems: 'center', paddingBottom: 10}}>
          <Text style={{fontSize: 22, color: '#4472C4'}}>
            {this.props.gameCode}
          </Text>
        </View>

        <Text style={{fontSize: 16, color: '#666'}}>
          {this.props.nPlayers} players have joined...
        </Text>

        {button}

        <ErrorMessage errorMessage={this.props.errorMessage} />
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
