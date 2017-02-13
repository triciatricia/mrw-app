import Exponent from 'exponent';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('./images/mrw.png')}
            style={styles.mrwLogo} />
          <Text>Hello there!</Text>
        </View>
        <View style={styles.playArea}>
          <Text>Open up main.js to start working on your app!</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    height: 130,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mrwLogo: {
    width: 170,
    height: 100,
  },
  playArea: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  }
});

Exponent.registerRootComponent(App);
