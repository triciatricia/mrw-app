// A message banner that spans the width of the page.
// Can be used to display warnings and messages.
// @flow

import React, {Component} from 'react';
import {Text, View, StyleSheet, Platform, TouchableWithoutFeedback} from 'react-native';
import {Constants} from 'expo';
import Button from 'react-native-button';

import COLORS from '../constants/colors';

const MESSAGE_COLORS = {
  error: COLORS.CORAL,
  warning: COLORS.YELLOW,
  message: COLORS.BLUE,
};

type propTypes = {
  text: string,
  title?: string,
  type: $Keys<typeof MESSAGE_COLORS>,
};

export default class MessageBanner extends Component<propTypes> {
  constructor(props: propTypes) {
    super(props);
  }

  render() {
    let title;
    if (this.props.title) {
      title = (
        <Text style={{
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: 'bold',
        }}>
          {this.props.title}
        </Text>);
    }
    return (
      <View style={{
        position: 'absolute',
        right: 0,
        left: 0,
        opacity: 0.97,
        top: 0,
        backgroundColor: MESSAGE_COLORS[this.props.type],
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 12,
        paddingBottom: 12,
      }}>
        {title}
        <Text style={{
          color: '#FFFFFF',
          fontSize: 14,
        }}>
          {this.props.text}
        </Text>
      </View>
    );
  }
}
