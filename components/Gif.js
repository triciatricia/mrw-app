/* @flow */

import React from 'react';
import {
  Image,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import Expo from 'expo';
import {preloadGif} from '../libraries/preloading';
import Sentry from 'sentry-expo';

import type {ImageUrl} from '../flow/types';

type propTypes = {
  width: number,
  height: number,
  marginBottom: number,
  source: ImageUrl,
};

type stateTypes = {
  imageLoading: boolean,
  localUri: ?string,
  mounted: boolean,
};

export default class Gif extends React.Component {
  props: propTypes;
  state: stateTypes;
  videoComponent: ?Expo.Video;

  constructor(props: propTypes) {
    super(props);
    this.state = {
      imageLoading: true,
      mounted: false,
      localUri: null,
    };
    this.videoComponent = null;
  }

  componentDidMount() {
    this.setState({mounted: true});
    this._loadImage(this.props.source);
  }

  componentWillReceiveProps(nextProps: propTypes) {
    if (nextProps.source.url != this.props.source.url) {
      console.log('switching from ' + this.props.source.url + ' to ' +
        nextProps.source.url);
      this.setState({
        imageLoading: true,
      });
      if (nextProps.source.url !== null &&
        nextProps.source.url !== '' &&
        nextProps.source.id > this.props.source.id) {
        this._loadImage(nextProps.source);
      }
    }
  }

  componentWillUnmount() {
    this.setState({mounted: false});
  }

  _isGif(URI) {
    return URI.endsWith('.gif');
  }

  async _loadImage(source) {
    source.localUri = await preloadGif(source);
    this.setState({
      imageLoading: false,
      localUri: source.localUri,
    });
  }

  async _handleVideoRef(videoComponent: Expo.Video) {
    // TODO, See how to update the Expo.Video
    // component to automatically unload the video.
    const prevVideo = this.videoComponent;
    if (prevVideo && prevVideo._root) {
      await prevVideo.unloadAsync();
    }
    this.videoComponent = videoComponent;
  }

  _renderMedia() {
    if (this.state.imageLoading || this.props.source.url == '') {
      return (
        <ActivityIndicator
          style={{width: this.props.width, height: 16, position: 'absolute'}}
          animating={this.state.imageLoading}
          size={'large'} />
      );
    }
    if (this._isGif(this.props.source.url) && this.state.localUri != null) {
      return (
        <Image
          style={{height: this.props.height, marginBottom: this.props.marginBottom}}
          resizeMode='contain'
          source={{uri: this.state.localUri}} />
      );
    }

    return (
      <Expo.Video
        style={{
          height: this.props.height,
          marginBottom: this.props.marginBottom,
        }}
        resizeMode={Expo.Video.RESIZE_MODE_CONTAIN}
        source={{uri: this.state.localUri}}
        shouldPlay={true}
        isMuted={true}
        isLooping={true}
        ref={this._handleVideoRef}
        onError={
          (e) => {
            console.log('Error loading video ' + this.props.source.url);
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
        {this._renderMedia()}
      </View>
    );
  }
}
