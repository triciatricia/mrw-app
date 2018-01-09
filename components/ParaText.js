/* @flow */
/* Common paragraph-like text */

import * as React from 'react';
import {
  Text,
} from 'react-native';

import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

type propTypes = {
  children?: React.Node,
  style?: StyleObj,
};

export default class ParaText extends React.Component<propTypes> {
  render() {
    return (
      <Text
        {...this.props}
        style={[
          {fontSize: 16, paddingBottom: 10},
          this.props.style,
        ]}
      >
        {this.props.children}
      </Text>
    );
  }
}
