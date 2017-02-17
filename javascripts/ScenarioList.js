/* List of scenarios submitted by players */

import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import ReactionScenario from './ReactionScenario';

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
    let scenarios = this._getScenarios();

    return (
      <View>
        {scenarios}
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
          submittedBy={id === this.props.winningResponse ? this.props.winningResponseSubmittedBy : null} />
        ));
  }
}
