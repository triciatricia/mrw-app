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
        <View style={{margin: 22, flex: 1}}>
          <View>
            <Text style={{
              fontSize: 20,
              paddingBottom: 10
            }}>
              Leave the game?
            </Text>

            <Button
              testID='LeaveGameConfirmButton'
              containerStyle={{
                padding: 10,
                overflow: 'hidden',
                borderRadius: 10,
                marginTop: 10,
                backgroundColor: '#4472C4',
                marginRight: 10}}
              style={{color: '#fff'}}
              onPress={this._onPressLeaveGame}
            >
              Yes, leave game
            </Button>
          </View>

          <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
          }} >
            <TouchableHighlight
              underlayColor='transparent'
              onPress={this.props.dismissLeaveGame}
            >
              <Text style={{
                color: colors.BLUE,
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
