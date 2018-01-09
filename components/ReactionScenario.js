// Individual scenarios submitted by players
/* @flow */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ParaText from './ParaText';

import COLORS from '../constants/colors';

type propTypes = {
  scenario: string,
  id: string,
  isChecked: boolean,
  onScenarioSelection: (scenarioID: string) => void,
  wasChosen: boolean,
  submittedBy: string,
};

export default class ReactionScenario extends React.Component<propTypes> {
  _onSelectScenario = () => this.props.onScenarioSelection(this.props.id);

  _radioChoices() {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
        <TouchableOpacity
          testID='ReactionScenarioRadioButton'
          onPress={this._onSelectScenario}
          style={this.props.isChecked ? styles.radioButtonChecked : styles.radioButton}
        >
          {this.props.isChecked ? <TouchableOpacity style={styles.radioButtonCenter} /> : null}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={this._onSelectScenario}
        >
          <Text style={{fontSize: 16, marginRight: 20}}>
            {this.props.scenario}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    if (this.props.useRadio) {
      return this._radioChoices();
    }
    return (
      <View>
        <View style={this.props.wasChosen ? styles.selectedTextView : null}>
          <ParaText style={this.props.wasChosen ? styles.selectedText : {}}>
            {this.props.scenario}
            <ParaText style={{color: COLORS.BLUE}}>
              {this.props.wasChosen ? ' ' + this.props.submittedBy + ' +1' : null}
            </ParaText>
          </ParaText>
          <ParaText
            style={[
              styles.selectedText,
              {position: 'absolute', right: 10, bottom: 0, backgroundColor: 'transparent'}
            ]}
          >
            {this.props.wasChosen ? this.props.submittedBy + ' +1' : null}
          </ParaText>
        </View>
      </View>
    )
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
    borderColor: COLORS.BLUE,
    marginRight: 5
  },
  radioButtonCenter: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: COLORS.BLUE,
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#fff',
    paddingTop: 10,
  },
  selectedTextView: {
    borderRadius: 10,
    backgroundColor: COLORS.BLUE,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    flex: 1,
  }
});
