import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default class ErrorMessage extends React.Component {
  render() {
    return (
      <View style={{paddingTop: 10, paddingBottom: 10}}>
        <Text
          testID='ErrorMessage' 
          style={{
            color: 'red',
            fontSize: 16
          }} >
          {this.props.errorMessage}
        </Text>
      </View>
    );
  }
}
