/* Individual scenarios submitted by players */

import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default class ReactionScenario extends React.Component {
  static propTypes = {
    scenario: React.PropTypes.string,
    id: React.PropTypes.string,
    isChecked: React.PropTypes.bool,
    onScenarioSelection: React.PropTypes.func,
    wasChosen: React.PropTypes.bool,
    submittedBy: React.PropTypes.string,

  };

  render() {
    if (this.props.isReactor && this.props.winningResponse === null) {
      return _radioChoices();
    }
    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between'}}>
        <Text style={{fontSize: 16, fontWeight: this.props.wasChosen ? 'bold' : 'normal'}}>
          {this.props.scenario}
        </Text>

        <Text style={{fontSize: 16, fontWeight: 'bold'}}>
          {this.props.wasChosen ? this.props.submittedBy + ' +1' : null}
        </Text>
      </View>
    )
  }

  _radioChoices() {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
        <TouchableOpacity
          onPress={() => {this.props.onScenarioSelection(this.props.id)}}
          style={styles.radioButton}>
          {this.props.isChecked ? <TouchableOpacity style={styles.radioButtonCenter} /> : null}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this.props.onScenarioSelection(this.props.id)}}>
          <Text style={{fontSize: 16}}>
            {this.props.scenario}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  radioButton: {
    height: 16,
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: 5
  },
  radioButtonCenter: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  }
});
