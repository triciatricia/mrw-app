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

export default class Settings extends React.Component {
  render() {
    return(
      <Modal
        animationType='fade'
        transparent={false}
        visible={this.props.settingsVisible}
        onRequestClose={()=>{}}>
        <View style={{margin: 22, flex: 1}}>
          <View>
            <Text style={{
              fontSize: 20,
              paddingBottom: 10
            }}>Settings</Text>

            <Button
              containerStyle={{
                padding: 10,
                overflow: 'hidden',
                borderRadius: 10,
                marginTop: 10,
                backgroundColor: '#4472C4',
                marginRight: 10}}
              style={{color: '#fff'}}
              onPress={() => {
                this.props.leaveGame();
                this.props.setSettingsVisible(false);
              }} >
              Leave Game
            </Button>
          </View>

          <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
          }} >
            <TouchableHighlight
              underlayColor='transparent'
              onPress={() => {
                this.props.setSettingsVisible(false)
              }} >
              <Text style={{
                color: colors.blue,
                paddingTop: 10,
                paddingBottom:10
              }}>Close</Text>
            </TouchableHighlight>
          </View>

       </View>
      </Modal>
    )
  }
}
