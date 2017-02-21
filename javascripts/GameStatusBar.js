import React from 'react';
import {
  Text,
  View,
} from 'react-native';

export default class GameStatusBar extends React.Component {
  static propTypes = {
    nickname: React.PropTypes.string,
    score: React.PropTypes.number,
    round: React.PropTypes.number,
    gameCode: React.PropTypes.string,
  };

  render() {
    return (
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 1}}>
          <Text style={{fontSize: 16}}>
            {this.props.nickname}
          </Text>
          <Text style={{fontSize: 16, paddingBottom: 10}}>
            Score: {this.props.score}
          </Text>
        </View>

        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Text style={{fontSize: 16}}>
            Round: {this.props.round}
          </Text>
          <Text style={{fontSize: 16, paddingBottom: 10}}>
            Game Code: {this.props.gameCode}
          </Text>
        </View>
      </View>
    );
  }
}
