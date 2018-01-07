/* @flow */

import React from 'react';
import {
  Text,
  View,
} from 'react-native';

type propTypes = {
  nickname: string,
  score: number,
  round: number,
  gameCode: string,
  waitingForScenarios: bool,
  timeLeft: ?number,
  responsesIn: number,
};

export default class GameStatusBar extends React.Component<propTypes> {
  render() {
    let timeLeft;
    let responsesInMessage;
    if (
      this.props.waitingForScenarios &&
      this.props.timeLeft !== null &&
      typeof this.props.timeLeft !== 'undefined'
    ) {
      timeLeft = <Text>{formatTime(this.props.timeLeft)}</Text>;
      if (this.props.responsesIn > 0) {
        responsesInMessage = this.props.responsesIn + ' ';
        responsesInMessage += this.props.responsesIn == 1 ? 'player has' : 'players have';
        responsesInMessage += ' responded so far.';
      } else if (
        this.props.timeLeft !== null &&
        typeof this.props.timeLeft !== 'undefined' &&
        this.props.timeLeft <= 0) {
        responsesInMessage = 'No one has responded yet. Waiting for at least one response...';
      }
    }
    return (
      <View style={{flexDirection: 'column'}}>
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
        <View>
          <Text testID='TimeLeft' style={{fontSize: 20, textAlign: 'center'}}>{timeLeft}</Text>
          <Text style={{fontSize: 14, textAlign: 'center', paddingBottom: 20}}>{responsesInMessage}</Text>
        </View>
      </View>
    );
  }
}

function formatTime(ms: number): string {
  // ms is in milliseconds.
  // Returns a string in the xx:xx (mins:secs) format.
  const mins = Math.floor(ms / 60000);
  let secs = Math.floor((ms - mins * 60000)/1000);
  if (secs <= 9) {
    secs = "0" + secs;
  }
  return '' + mins + ':' + secs;
}
