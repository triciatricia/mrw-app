/* @flow */

import React from 'react';
import {
  ActivityIndicator,
  Clipboard,
  Image,
  Text,
  View,
} from 'react-native';
import Expo from 'expo';
import {preloadGifAsync} from '../libraries/preloading';
import Sentry from 'sentry-expo';

import Popover from './Popover';

import COLORS from '../constants/colors';

import type {ImageUrl} from '../flow/types';

type propTypes = {
  width: number,
  height: number,
  marginBottom: number,
  source: ImageUrl,
  gameID: string,
  addToImageCache: (id: number, url: string) => void,
};

type stateTypes = {
  imageLoading: boolean,
  localUri: ?string,
  mounted: boolean,
  downloadResumable: Expo.FileSystem.DownloadResumable | null,
  downloadPercentDisplay: string,
};

export default class Gif extends React.Component<propTypes, stateTypes> {

  constructor(props: propTypes) {
    super(props);
    this.state = {
      imageLoading: true,
      mounted: false,
      localUri: null,
      downloadResumable: null,
      downloadPercentDisplay: '0',
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
    this._loadImageAsync(this.props.source);
  }

  componentWillReceiveProps(nextProps: propTypes) {
    if (nextProps.source.url != this.props.source.url) {
      if (nextProps.source.url !== '') {
        console.log('switching to ' + nextProps.source.url);
      }
      if (nextProps.source.url !== null &&
        nextProps.source.url !== '' &&
        nextProps.source.id > this.props.source.id) {
        this._loadImageAsync(nextProps.source);
      }
      this.setState({
        imageLoading: true,
      });
    }
  }

  componentWillUnmount() {
    this.setState({mounted: false});
  }

  _isGif(URI) {
    return URI.endsWith('.gif');
  }

  async _loadImageAsync(source) {
    // Cancel previous download
    if (this.state.imageLoading && this.state.downloadResumable) {
      try {
        await this.state.downloadResumable.pauseAsync();
      } catch(err) {
        console.log(err);
      }
    }

    const checkDownloadProgress = (
      downloadData: {
        totalBytesWritten: number,
        totalBytesExpectedToWrite: number,
      }
    ) => {
      this.setState({
        downloadPercentDisplay: (
          downloadData.totalBytesWritten /
          downloadData.totalBytesExpectedToWrite * 100
        ).toFixed(0),
      });
    };

    const saveDownloadResumable = (
      downloadResumable: Expo.FileSystem.DownloadResumable
    ) => {
      this.setState({
        downloadPercentDisplay: '0',
        downloadResumable: downloadResumable,
      });
    };

    source.localUri = await preloadGifAsync(source, this.props.gameID, this.props.addToImageCache, checkDownloadProgress, saveDownloadResumable);
    // Check to make sure the source hadn't been overwritten (image hasn't been
    // skipped) in the time it took to download.
    if (this.props.source.id <= source.id) {
      this.setState({
        imageLoading: false,
        localUri: source.localUri,
      });
      console.log('_loadImageAsync done: ', this.state.localUri);
    }
  }

  _onPressCopyButton = () => Clipboard.setString(this.props.source.url);

  _onVideoError = (e) => {
    console.log('Error loading video ' + this.props.source.url);
    console.log(e);
  };

  _renderMedia() {
    const localUri = this.state.localUri;

    if (this.state.imageLoading || !localUri || this.props.source.url == '') {
      return (
        <View style={{alignItems: 'center'}}>
          <ActivityIndicator
            style={{width: this.props.width, height: 16, position: 'absolute'}}
            animating={true}
            color={COLORS.MED_GRAY}
            size='large'
          />
          <Text style={{
            textAlign: 'center',
            color: COLORS.DARK_GRAY,
            backgroundColor: 'transparent',
          }}>
            {this.state.downloadPercentDisplay !== '100' ? this.state.downloadPercentDisplay + '%' : null}
          </Text>
        </View>
      );
    }
    if (this._isGif(this.props.source.url) && this.state.localUri != null) {
      return (
        <Image
          style={{height: this.props.height, marginBottom: this.props.marginBottom}}
          resizeMode='contain'
          source={{uri: this.state.localUri}}
        />
      );
    }

    return (
      <Popover
        text='Copy URL to Clipboard'
        onPressButton={this._onPressCopyButton}
      >
        <Expo.Video
          style={{
            height: this.props.height,
            marginBottom: this.props.marginBottom,
          }}
          resizeMode={Expo.Video.RESIZE_MODE_CONTAIN}
          source={{uri: localUri}}
          shouldPlay={true}
          isMuted={true}
          isLooping={true}
          onError={this._onVideoError}
        />
      </Popover>
    );
  }

  render() {
    return (
      <View
        testID='GifView'
        style={{
          justifyContent: 'center',
          height: this.props.height,
          marginBottom: this.props.marginBottom,
        }} >
        {this._renderMedia()}
      </View>
    );
  }
}
