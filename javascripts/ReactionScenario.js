/* Individual scenarios submitted by players */

import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import ParaText from './ParaText';
import COLORS from '../constants/colors';

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
      <View>
        <View style={this.props.wasChosen ? styles.selectedTextView : null}>
          <ParaText style={this.props.wasChosen ? styles.selectedText : {}}>
            {this.props.scenario}
            <ParaText style={{color: COLORS.blue}}>
              {this.props.wasChosen ? ' ' + this.props.submittedBy + ' +1' : null}
            </ParaText>
          </ParaText>
          <ParaText style={[styles.selectedText, {position: 'absolute', right: 10, bottom: 0, backgroundColor: 'transparent'}]}>
            {this.props.wasChosen ? this.props.submittedBy + ' +1' : null}
          </ParaText>
        </View>
      </View>
    )
  }

  _radioChoices() {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
        <TouchableOpacity
          onPress={() => {this.props.onScenarioSelection(this.props.id)}}
          style={this.props.isChecked ? styles.radioButtonChecked : styles.radioButton}>
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
  radioButtonChecked: {
    height: 16,
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.blue,
    marginRight: 5
  },
  radioButtonCenter: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#fff',
    paddingTop: 10,
  },
  selectedTextView: {
    borderRadius: 10,
    backgroundColor: COLORS.blue,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    flex: 1,
  }
});
