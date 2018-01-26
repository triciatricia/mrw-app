// @flow
import React from 'react';
import {
  Text,
  View,
  TouchableHighlight,
  Image,
  Modal,
} from 'react-native';
import colors from '../constants/colors';
import Button from 'react-native-button';

type propTypes = {
  dismissLeaveGame: () => void,
  leaveGameConfirmationVisible: boolean,
  onPressConfirmLeaveGame: () => void,
};

export default class LeaveGameConfirmation extends React.Component<propTypes> {
  _onPressLeaveGame = () => {
    this.props.onPressConfirmLeaveGame();
    this.props.dismissLeaveGame();
  };

  render() {
    return (
      <Modal
        animationType='fade'
        transparent={false}
        visible={this.props.leaveGameConfirmationVisible}
        onRequestClose={()=>{}}
      >
        <View style={{
          margin: 22,
          flex: 1,
          paddingTop: 20,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}>
          <View style={{alignItems: 'center'}}>
            <Text style={{
              fontSize: 30,
            }}>
              Leave the game?
            </Text>
          </View>

          <Button
            testID='LeaveGameConfirmButton'
            containerStyle={{
              padding: 10,
              overflow: 'hidden',
              borderRadius: 10,
              marginTop: 10,
              backgroundColor: '#4472C4',
              marginRight: 10}}
            style={{color: '#fff', fontSize: 16}}
            onPress={this._onPressLeaveGame}
          >
            Yes, leave game
          </Button>

          <View style={{alignItems: 'center'}}>
            <TouchableHighlight
              underlayColor='transparent'
              onPress={this.props.dismissLeaveGame}
            >
              <Text style={{
                color: colors.BLUE,
                fontSize: 16,
                paddingTop: 10,
                paddingBottom:10
              }}>
                Cancel
              </Text>
            </TouchableHighlight>
          </View>
       </View>
      </Modal>
    );
  }
}
