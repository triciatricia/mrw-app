/* @flow */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Share,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import Button from 'react-native-button';
import Swiper from 'react-native-swiper';

import Gif from './Gif';
import ParaText from './ParaText';
import ErrorMessage from './ErrorMessage';

import COLORS from '../constants/colors';

import type { GameInfo, PlayerInfo, ImageUrl } from '../flow/types';

const WINDOW_HEIGHT: number = Dimensions.get('window').height;
const HEADER_HEIGHT = 70;
const MAX_GIFS_SHOWN = 10; // Only show up to 10 gifs in the carousel

type propTypes = {
  gameInfo: GameInfo,
  playerInfo: PlayerInfo,
  startGame: () => Promise<void>,
  errorMessage: ?string,
  imageCache: {[number]: string},
  addToImageCache: (id: number, url: string) => void,
};

type stateTypes = {
  isLoading: boolean,
  swiperGif: {
    gameImageId: number,
    imageUrl: string,
    scenario: string,
    reactorNickname: string,
  } | null,
};

export default class GameOver extends React.Component<propTypes, stateTypes> {
  constructor(props: propTypes) {
    super(props);
    this.state = {
      isLoading: false,
      swiperGif: (
        this.props.gameInfo.gameImages ?
        this.props.gameInfo.gameImages[Math.max(0, this.props.gameInfo.gameImages.length - MAX_GIFS_SHOWN)] :
        null
      ),
    };
  }

  shouldComponentUpdate(nextProps: propTypes, nextState: stateTypes) {
    return (
      (nextProps.gameInfo.round != this.props.gameInfo.round) ||
      (nextProps.errorMessage != this.props.errorMessage) ||
      (this.state.isLoading != nextState.isLoading) ||
      (Object.keys(this.props.gameInfo.scores).length != Object.keys(nextProps.gameInfo.scores).length) ||
      (Object.keys(this.props.imageCache).length != Object.keys(nextProps.imageCache).length) ||
      (!this.props.gameInfo.gameImages) ||
      (nextState.swiperGif != this.state.swiperGif)
    );
  }

  _startGame = () => {
    this.setState({
      isLoading: true
    });
    this.props.startGame();
  }

  _renderScoreTable() {
    // Display scores in descending order with the top bold
    const scores = this.props.gameInfo.scores;
    let playersSorted = Object.keys(scores);
    playersSorted.sort((p1, p2) => (scores[p2] - scores[p1]));
    const highestScore = scores[playersSorted[0]];

    return playersSorted.map(
    player => {
      return (
        <ParaText
          key={player}
          style={{fontWeight: scores[player] == highestScore ? 'bold' : 'normal'}}
          >
          {scores[player]} {player}
        </ParaText>
      );
    });
  }

  render() {
    const rematchButton = (
      <Button
        id="rematchButton"
        containerStyle={styles.newGameContainer}
        style={styles.newGameText}
        onPress={this._startGame}>
        {this.state.isLoading && this.props.errorMessage == null ?
          'Loading...' :
          'Again!'}
      </Button>);

    const gifCarousel = this._renderGifCarousel();

    return (
      <ScrollView style={styles.main}>
        <View style={{minHeight: WINDOW_HEIGHT - HEADER_HEIGHT - 340, justifyContent: 'center'}}>
          <ParaText style={styles.h2Text}>And we&#39;re done!</ParaText>

          {gifCarousel}

          <View>{this._renderScoreTable()}</View>

          {rematchButton}

          <ErrorMessage
            errorMessage={this.props.errorMessage} />
        </View>
      </ScrollView>
    );
  }

  // Function to render a carousel displaying gifs and their scenarios.
  _renderGifCarousel = () => {
    if (!this.props.gameInfo.gameImages) {
      return;
    }

    const gameImages = this.props.gameInfo.gameImages.slice(-MAX_GIFS_SHOWN);
    const gifsAndScenarios = gameImages.map(this._renderGif);
    // TODO Remove this when iOS stops showing the last item as part of the first.
    gifsAndScenarios.push(this._renderGif(gameImages[0], gameImages[0].gameImageId - 1));
    const shareButton = this._renderShareButton();

    let gifsIntroText = 'Take a look at these awesome reactions...';
    if (this.props.gameInfo.gameImages && this.props.gameInfo.gameImages.length > MAX_GIFS_SHOWN) {
      gifsIntroText = `Here are the last ${MAX_GIFS_SHOWN} reactions! Pretty awesome, right?`;
    }

    return (
      <View>
        <Text style={{fontSize: 20}}>
          {gifsIntroText}
        </Text>
        <Swiper
          autoplay={true}
          removeClippedSubviews={true}
          showsPagination={true}
          dotStyle={{backgroundColor: COLORS.MED_GRAY}}
          activeDotStyle={{backgroundColor: COLORS.BLUE}}
          height={345}
          ref='swiper'
          autoplayTimeout={4}
          style={styles.swiper}
          showsButtons={true}
          nextButton={<Entypo name="chevron-right" size={40} color={COLORS.BLUE} />}
          prevButton={<Entypo name="chevron-left" size={40} color={COLORS.BLUE} />}
          onIndexChanged={(i) => {
            if (i < gameImages.length) {
              this.setState({
                swiperGif: gameImages[i],
              });
            }
            // TODO Remove this when iOS stops showing the last item as part of the first.
            if (gifsAndScenarios && i === gifsAndScenarios.length - 1 && this.refs.swiper) {
              this.refs.swiper.scrollBy(-(gifsAndScenarios.length - 2), false);
            }
          }} >
          {gifsAndScenarios}
        </Swiper>
        {shareButton}
      </View>);
  }

  // Function to render a gif with the scenario below.
  _renderGif = (
    source: {
      gameImageId: number,
      imageUrl: string,
      scenario: string,
      reactorNickname: string,
    },
    id?: number,
  ) => {
    if (!id) {
      id = source.gameImageId;
    }

    const scenario = `${source.reactorNickname}'s reaction when ${source.scenario}`;
    const prefetched = this.props.imageCache.hasOwnProperty(source.gameImageId);
    const localUri = this.props.imageCache[source.gameImageId];

    return (
      <View style={{flex: 1, justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'center'}} key={id}>
        <View style={{flex: 1}}>
          <Gif
            style={{flex: 1, alignItems: 'stretch', justifyContent: 'center'}}
            width={200}
            height={200}
            marginBottom={6}
            key={`gif_${id}`}
            addToImageCache={this.props.addToImageCache}
            gameID={this.props.gameInfo.id}
            source={{url: source.imageUrl, id: source.gameImageId, prefetched: prefetched, localUri: localUri}} />
          <View
            style={styles.scenarioView}
            key={`text_${id}`} >
            <ScrollView>
              <Text style={{fontSize: 16, flex: 0, paddingRight: 10, paddingLeft: 10, color: 'white'}}>
                {scenario}
              </Text>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };

  _renderShareButton = () => {
    let shareButton;
    const swiperGif = this.state.swiperGif;
    if (swiperGif) {
      const shareReaction = () => {
        Share.share({
          message: `${swiperGif.reactorNickname}'s reaction when ${swiperGif.scenario}\n${swiperGif.imageUrl}`,
        }, {
          dialogTitle: `Share ${swiperGif.reactorNickname}'s reaction`,
        });
      };
      shareButton = (
        <Button
          containerStyle={styles.shareButton}
          onPress={shareReaction}>
          <Entypo
            name={Platform.OS === 'ios' ? 'share-alternative' : 'share'}
            size={26}
            color={COLORS.BLUE} />
        </Button>
      );
    }

    return shareButton;
  };
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 20,
  },
  h2Text: {
    fontSize: 40,
    color: '#333',
  },
  newGameContainer: {
    padding: 10,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#4472C4',
  },
  newGameText: {
    color: '#FFF',
    fontSize: 20,
  },
  scenarioView: {
    width: 335,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 60,
  },
  shareButton: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flex: 0,
    position: 'absolute',
    bottom: 20,
    right: 10,
  },
  swiper: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'black',
    height: 310,
  },
});
