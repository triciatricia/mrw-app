/* @flow */

import React from 'react';
import {
  Image,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

type propTypes = {
  width: number,
  height: number,
  marginBottom: number,
  sourceURI: string,
};

export default class Gif extends React.Component {
  props: propTypes;
  state: {
    imageLoading: boolean,
    mounted: boolean,
  };

  constructor(props: propTypes) {
    super(props);
    this.state = {
      imageLoading: true,
      mounted: false,
    };
  }

  componentWillMount() {
    this._loadImage(this.props.sourceURI);
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  componentWillReceiveProps(nextProps: propTypes) {
    if (nextProps.sourceURI !== this.props.sourceURI) {
      this.setState({
        imageLoading: true,
      });
      this._loadImage(nextProps.sourceURI);
    }
  }

  componentWillUnmount() {
    this.setState({mounted: false});
  }

  async _loadImage(URI) {
    await Image.prefetch(URI);
    if (this.state.mounted) {
      this.setState({imageLoading: false});
    }
  }

  render() {
    if (!this.state.imageLoading) {
      return (
        <Image
          style={{height: this.props.height, marginBottom: this.props.marginBottom}}
          resizeMode='contain'
          source={{uri: this.props.sourceURI}} />
      );
    }

    return (
      // Loading indicator
      <View style={{
        justifyContent: 'center',
        height: this.props.height,
        marginBottom: this.props.marginBottom,
      }}>
        <ActivityIndicator
          style={{ width: this.props.width, height: 16, position: 'absolute' }}
          animating={true}
          size={'large'} />
      </View>
    );

  }
}
