/* List of scenarios submitted by players */

import React from 'react';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';
import ReactionScenario from './ReactionScenario';
import Button from 'react-native-button';

export default class ScenarioList extends React.Component {
  static propTypes = {
    scenarios: React.PropTypes.object,
    reactorNickname: React.PropTypes.string,
    winningResponse: React.PropTypes.string,
    winningResponseSubmittedBy: React.PropTypes.string,
    isReactor: React.PropTypes.bool,
    chooseScenario: React.PropTypes.func,
  };

  constructor(props) {
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
          onPress={() => this.props.chooseScenario(this.state.selectedScenario)} >
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
          submittedBy={id == this.props.winningResponse ? this.props.winningResponseSubmittedBy : null} />
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
