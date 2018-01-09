// A popover button that is visible below the child component when long pressed
// @flow

import * as React from 'react';
import {Component} from 'react';
import {
  Animated,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Constants} from 'expo';
import Button from 'react-native-button';

import COLORS from '../constants/colors';

const ARROW_HEIGHT = 12;

type propTypes = {
  onPressButton: () => void,
  text: string,
  children?: React.Node,
};

type stateTypes = {
  popoverVisible: boolean,
  popoverY: number,
  opacity: Animated.Value,
};

export default class Popover extends Component<propTypes, stateTypes> {
  buttonView: ?View;

  constructor(props: propTypes) {
    super(props);
    this.state = {
      popoverVisible: false,
      popoverY: 0,
      opacity: new Animated.Value(1),
    };
  }

  _onHidePopover = () => {
    this.setState({
      popoverVisible: false,
    });
  }

  _onPressButton = () => {
    this.props.onPressButton();
    this._onHidePopover();
  };

  _onPressIn = () => {
    this._fade();
    Keyboard.dismiss();
  };

  _onShowPopover = () => {
    this._resetOpacity();
    if (this.buttonView) {
      this.buttonView.measure((x, y, w, h, px, py) => {
        let popoverY = py + h;
        if (Platform.OS === 'android') {
          popoverY = popoverY - Constants.statusBarHeight;
        }
        this.setState({
          popoverVisible: true,
          popoverY: popoverY,
        });
      });
    }
  };

  _fade = () => {
    Animated.timing(
      this.state.opacity,
      {
        toValue: 0.3,
        duration: 400,
      }
    ).start();
  };

  _resetOpacity = () => {
    Animated.timing(
      this.state.opacity,
      {
        toValue: 1,
        duration: 100,
      }
    ).start();
  };

  _doNothing = () => {};

  _setButtonViewRef = v => this.buttonView = v;

  render() {
    return (
      <View>
        <View
          ref={this._setButtonViewRef}
          onLayout={this._doNothing}
        >
          <Animated.View style={{opacity: this.state.opacity,}}>
            <TouchableWithoutFeedback
              onLongPress={this._onShowPopover}
              onPressIn={this._onPressIn}
              onPressOut={this._resetOpacity}
            >

              {this.props.children}

            </TouchableWithoutFeedback>
          </Animated.View>
        </View>

        <Modal
          transparent={true}
          visible={this.state.popoverVisible}
          onRequestClose={this._onHidePopover}
        >
          <TouchableWithoutFeedback
            onPress={this._onHidePopover}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.popoverArrow, {
                top: this.state.popoverY + 3,
              }]}/>
              <View style={[styles.popoverBox, {
                top: this.state.popoverY + ARROW_HEIGHT,
              }]}>
                <Button
                  onPress={this._onPressButton}
                  containerStyle={styles.buttonContainer}
                  style={styles.buttonText}
                >
                  {this.props.text}
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#00000050',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popoverArrow: {
    backgroundColor: '#FFFFFF',
    width: 26,
    height: 26,
    transform: [{rotate: '45deg'}],
    borderRadius: 6,
    position: 'absolute',
  },
  popoverBox: {
    backgroundColor: '#FFFFFF',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    borderRadius: 10,
  },
  buttonContainer: {
    padding: 10,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 16,
    color: COLORS.BLUE,
  },
});
