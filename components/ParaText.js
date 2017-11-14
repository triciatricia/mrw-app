/* @flow */
/* Common paragraph-like text */

import React from 'react';
import {
  Text,
} from 'react-native';

export default class ParaText extends React.Component {
  render() {
    return (
      <Text
        {...this.props}
        style={[
          {fontSize: 16, paddingBottom: 10},
          this.props.style]}>
        {this.props.children}
      </Text>
    );
  }
}
