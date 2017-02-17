/* Individual scenarios submitted by players */

import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import ParaText from './ParaText';

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
    if (this.props.useRadio) {
      return this._radioChoices();
    }
    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'}}>
        <View style={this.props.wasChosen ? styles.selectedTextView : null}>
          <ParaText style={this.props.wasChosen ? styles.selectedText : {}}>
            {this.props.scenario}
          </ParaText>
        </View>

        <ParaText style={{fontWeight: 'bold'}}>
          {this.props.wasChosen ? this.props.submittedBy + ' +1' : null}
        </ParaText>
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
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#fff',
    paddingTop: 10,
  },
  selectedTextView: {
    borderRadius: 10,
    backgroundColor: '#2355ad',
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
  }
});
