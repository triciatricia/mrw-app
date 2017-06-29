/* List of scenarios submitted by players */

/* @flow */

import React from 'react';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';
import ReactionScenario from './ReactionScenario';
import Button from 'react-native-button';

type propTypes = {
  scenarios: { [scenarioID: string]: string },
  reactorNickname: string,
  winningResponse: ?string,
  winningResponseSubmittedBy: ?string,
  isReactor: boolean,
  chooseScenario: (choiceID: string) => Promise<void>,
}

export default class ScenarioList extends React.Component {
  props: propTypes;
  state: {
    selectedScenario: ?string,
  };

  constructor(props: propTypes) {
    super(props);
    this.state = {
      selectedScenario: null
    };
  }

  render() {
    const scenarios = this._getScenarios();
    let button;
    if (this.props.isReactor && this.props.winningResponse == null) {
      button = (
        <Button
          containerStyle={[styles.buttonContainer, {backgroundColor: this.state.selectedScenario ? '#4472C4' : '#eee'}]}
          style={[styles.buttonText, {color: this.state.selectedScenario ? '#fff' : '#333'}]}
          onPress={() => {
            if (this.state.selectedScenario != null) {
              this.props.chooseScenario(this.state.selectedScenario);
            }
          }} >
          Submit
          </Button>
        );
    }

    return (
      <View>
        <View>
          {scenarios}
        </View>
        {button}
      </View>
    );
  }

  _getScenarios() {
    return Object.getOwnPropertyNames(this.props.scenarios).map(
      (id) => (
        <ReactionScenario
          scenario={this.props.scenarios[id]}
          id={id}
          key={id}
          useRadio={this.props.isReactor && this.props.winningResponse === null}
          isChecked={this.state.selectedScenario == id}
          wasChosen={id == this.props.winningResponse}
          onScenarioSelection={(value) => {
            this.setState({
              selectedScenario: value
            });
          }}
          submittedBy={
            (this.props.winningResponseSubmittedBy != null && id == this.props.winningResponse ?
              this.props.winningResponseSubmittedBy : '')} />
        ));
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 10,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#eee',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
});
