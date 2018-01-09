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
  onChooseScenario: (choiceID: string) => Promise<void>,
};

type stateTypes = {
  selectedScenario: ?string,
};

export default class ScenarioList extends React.Component<propTypes, stateTypes> {
  constructor(props: propTypes) {
    super(props);
    this.state = {
      selectedScenario: null
    };
  }

  _onPressSubmitButton = () => {
    if (this.state.selectedScenario != null) {
      this.props.onChooseScenario(this.state.selectedScenario);
    }
  };

  _onScenarioSelection = (value: string) => {
    this.setState({
      selectedScenario: value
    });
  };

  _scenarios() {
    return Object.getOwnPropertyNames(this.props.scenarios).map(
      id => (
        <ReactionScenario
          scenario={this.props.scenarios[id]}
          id={id}
          key={id}
          useRadio={this.props.isReactor && this.props.winningResponse === null}
          isChecked={this.state.selectedScenario == id}
          wasChosen={id == this.props.winningResponse}
          onScenarioSelection={this._onScenarioSelection}
          submittedBy={
            (this.props.winningResponseSubmittedBy != null && id == this.props.winningResponse ?
              this.props.winningResponseSubmittedBy : '')}
        />
      )
    );
  }

  render() {
    const scenarios = this._scenarios();
    let button;
    if (this.props.isReactor && this.props.winningResponse == null) {
      button = (
        <Button
          testID='ChooseScenarioButton'
          containerStyle={[styles.buttonContainer, {backgroundColor: this.state.selectedScenario ? '#4472C4' : '#eee'}]}
          style={[styles.buttonText, {color: this.state.selectedScenario ? '#fff' : '#333'}]}
          onPress={this._onPressSubmitButton}
        >
          Submit
        </Button>
      );
    }

    return (
      <View>
        <View testID='ScenarioList'>
          {scenarios}
        </View>
        {button}
      </View>
    );
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
