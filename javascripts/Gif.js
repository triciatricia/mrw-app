/* @flow */

import React from 'react';
import {
  Image,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import Expo, { Video } from 'expo';
import Sentry from 'sentry-expo';

type propTypes = {
  width: number,
  height: number,
  marginBottom: number,
  sourceURI: string,
};

type stateTypes = {
  imageLoading: boolean,
  mounted: boolean,
};

export default class Gif extends React.Component {
  props: propTypes;
  state: stateTypes;

  constructor(props: propTypes) {
    super(props);
    this.state = {
      imageLoading: true,
      mounted: false,
    };
  }

  componentDidMount() {
    this._loadImage(this.props.sourceURI);
    this.setState({ mounted: true });
  }

  componentWillReceiveProps(nextProps: propTypes) {
    if (nextProps.sourceURI !== this.props.sourceURI) {
      console.log('switching from ' + this.props.sourceURI + ' to ' +
        nextProps.sourceURI);
      this.setState({
        imageLoading: true,
      });
      this._loadImage(nextProps.sourceURI);
    }
  }

  componentWillUnmount() {
    this.setState({ mounted: false });
  }

  _isGif(URI) {
    return URI.endsWith('.gif');
  }

  async _loadImage(URI) {
    if (this._isGif(URI)) {
      await Image.prefetch(URI);
    } else {
      // Can't prefetch a video.
      // await Expo.Asset.???.downloadAsync();
    }

    if (this.state.mounted) {
      this.setState({ imageLoading: false });
    }
  }

  _onLoadVideo(playbackStatus: Object) {
    if (playbackStatus.isLoaded) {
      if (this.state && this.state.mounted) {
        this.setState({ imageLoading: false });
      }
    }
  }

  _renderMedia() {
    if (this._isGif(this.props.sourceURI)) {
      if (this.state.imageLoading) {
        return (
          <ActivityIndicator
            style={{ width: this.props.width, height: 16, position: 'absolute' }}
            animating={this.state.imageLoading}
            size={'large'} />
        );
      }

      return (
        <Image
          style={{ height: this.props.height, marginBottom: this.props.marginBottom }}
          resizeMode='contain'
          source={{ uri: this.props.sourceURI }} />
      );
    }

    return (
      <Expo.Video
        style={{
          height: this.props.height,
          marginBottom: this.props.marginBottom,
        }}
        resizeMode={ Expo.Video.RESIZE_MODE_CONTAIN }
        source={{ uri: this.props.sourceURI }}
        shouldPlay={ true }
        isMuted={ true }
        isLooping={ true }
        onLoad={ this._onLoadVideo }
        onError={
          (e) => {
            console.log('Error loading video ' + this.props.sourceURI);
            console.log(e);
          }
        }
        />
    );
  }

  render() {
    return (
      <View style={{
        justifyContent: 'center',
        height: this.props.height,
        marginBottom: this.props.marginBottom,
      }}>
        { this._renderMedia() }
      </View>
    );
  }
}
