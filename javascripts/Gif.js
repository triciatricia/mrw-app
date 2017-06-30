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

export default class Gif extends React.Component {
  props: propTypes;
  state: {
    imageLoading: boolean,
    mounted: boolean,
  };
  playbackInstance: ?Expo.Video = null;

  constructor(props: propTypes) {
    super(props);
    this.state = {
      imageLoading: true,
      mounted: false,
      playbackInstance: null,
    };
  }

  componentWillMount() {
    this._loadImage(this.props.sourceURI);
  }

  componentDidMount() {
    this.setState({ mounted: true });
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
    this.setState({ mounted: false });
  }

  _isGif(URI) {
    return URI.endsWith('.gif');
  }

  async _loadImage(URI) {
    if (this._isGif(URI)) {
      await Image.prefetch(URI);
      if (this.state.mounted) {
        this.setState({ imageLoading: false });
      }
    }
  }

  _unloadCurVideo = async () => {
    if (this.playbackInstance != null) {
      await this.playbackInstance.unloadAsync();
    }
    if (this.playbackInstance != null) {
      this.playbackInstance.setCallback(null);
      this.playbackInstance = null;
    }
  }

  _handleVideoRef = async (component) => {
    const playbackObject = component;
    await this._unloadCurVideo();

    // Play Video
    const source = { uri: this.props.sourceURI };

    playbackObject.setCallback(status => {
      if (status.error) {
        console.log('Error playing ' + source.uri);
        // TODO Set an error message
      }
    });

    try {
      await playbackObject.loadAsync(
        source,
        {
          shouldPlay: true,
          isMuted: true,
          isLooping: true,
        });
    }
    catch(error) {
      console.log('Error playing ' + source.uri);
      Sentry.captureMessage(
        'Error playing ' + source.uri,
        { level: 'warning' },
      );
    }

    this.playbackInstance = playbackObject;

    this.setState({ imageLoading: false });
  }

  render() {
    let gif = (
      <Expo.Video
        style={{
          height: this.props.height,
          marginBottom: this.props.marginBottom,
        }}
        resizeMode={Expo.Video.RESIZE_MODE_CONTAIN}
        ref={this._handleVideoRef} />
    );

    if (this._isGif(this.props.sourceURI)) {
      if (!this.state.imageLoading) {
        gif = (
          <Image
            style={{ height: this.props.height, marginBottom: this.props.marginBottom }}
            resizeMode='contain'
            source={{ uri: this.props.sourceURI }} />
        );
      } else {
        gif = null;
      }
    }

    return (
      <View style={{
        justifyContent: 'center',
        height: this.props.height,
        marginBottom: this.props.marginBottom,
      }}>

        { gif }

        <ActivityIndicator
          style={{ width: this.props.width, height: 16, position: 'absolute' }}
          animating={this.state.imageLoading}
          size={'large'} />

      </View>
    );
  }
}
