// @flow
import React from 'react';
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import colors from '../constants/colors';

import Button from 'react-native-button';
import Swiper from 'react-native-swiper';

const WINDOW_WIDTH = Dimensions.get('window').width;

type propTypes = {
  onDismissWelcomeScreen: () => void,
  welcomeScreenVisible: boolean,
};

export default class WelcomeScreen extends React.Component<propTypes> {
  _onPressWelcomeScreen = () => {
    this.props.onDismissWelcomeScreen();
  };

  render() {
    let mrwLogo = (<View></View>);
    if (WINDOW_WIDTH >= 600) {
      // Only display logo if there's a lot of room (ie: tablet)
      mrwLogo = (
        <Image
          source={require('../images/mrw_face_small.png')}
          style={{
            width: 30,
            height: 30,
            resizeMode: 'contain',
            flex: 0,
          }}
        />
      );
    }


    return (
      <Modal
        animationType='fade'
        transparent={false}
        visible={this.props.welcomeScreenVisible}
        onRequestClose={()=>{}}
      >
        <View style={{
          margin: 22,
          flex: 1,
          paddingTop: 20,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}>
          <Text style={[styles.headerText, {paddingTop: 6, fontSize: WINDOW_WIDTH > 400 ? 22 : 18}]}>
            Welcome to My Reaction When
          </Text>
          <Text style={[styles.descriptionText, {paddingBottom: 15}]}>
            The party game with gifs!
          </Text>

          <Swiper
            autoplay={false}
            removeClippedSubviews={false}
            showsPagination={true}
            loop={false}
            dotStyle={{backgroundColor: colors.MED_GRAY}}
            activeDotStyle={{backgroundColor: colors.BLUE}}
            style={{}}
            showsButtons={false}
          >

            <View style={styles.swiperElement}>
              <View style={[styles.imageView, {backgroundColor: colors.DARK_BLUE}]}>
                {mrwLogo}
                <Image
                  source={require('../images/screenshots/new_game.png')}
                  style={{
                    width: Math.min(WINDOW_WIDTH - 100, 300),
                    resizeMode: 'contain',
                    flex: 2,
                  }}
                />
              </View>

              <View style={styles.textView}>
                <Text style={styles.headerText}>
                  1. Create a new game.
                </Text>
              </View>
            </View>

            <View style={styles.swiperElement}>
              <View style={[styles.imageView, {backgroundColor: colors.CORAL}]}>
                {mrwLogo}
                <Image
                  source={require('../images/screenshots/game_code.png')}
                  style={{
                    width: Math.min(WINDOW_WIDTH - 100, 300),
                    resizeMode: 'contain',
                    flex: 2,
                  }}
                />
              </View>
              <View style={styles.textView}>
                <Text style={styles.headerText}>
                  2. Ask your friends to join.
                </Text>
                <Text style={styles.descriptionText}>
                  They can join the game by entering in the game code on their phones.
                </Text>
              </View>
            </View>

            <View style={styles.swiperElement}>
              <View style={[styles.imageView, {backgroundColor: colors.GREEN}]}>
                {mrwLogo}
                <Image
                  source={require('../images/screenshots/start_now.png')}
                  style={{
                    width: Math.min(WINDOW_WIDTH - 100, 300),
                    resizeMode: 'contain',
                    flex: 2,
                  }}
                />
              </View>
              <View style={styles.textView}>
                <Text style={styles.headerText}>
                  3. Start inventing scenarios!
                </Text>
                <Text style={styles.descriptionText}>
                  A gif & a player{"'"}s name will appear. What scenario would make the player respond like in the gif? Submit your answer!
                </Text>
              </View>
            </View>

          </Swiper>

          <Button
            testID='WelcomeScreenDismissButton'
            containerStyle={{
              padding: 10,
              overflow: 'hidden',
              borderRadius: 10,
              marginTop: 10,
              backgroundColor: '#4472C4',
              marginRight: 10}}
            style={{color: '#fff', fontSize: 16}}
            onPress={this.props.onDismissWelcomeScreen}
          >
            OK!
          </Button>
       </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  swiperElement: {
    alignItems: 'stretch',
    flex: 1
  },
  imageView: {
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    width: WINDOW_WIDTH - 40,
    padding: 10,
  },
  textView: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    paddingBottom: 30,
  },
  headerText: {
    fontSize: WINDOW_WIDTH > 400 ? 20 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 4,
  },
  descriptionText: {
    fontSize: WINDOW_WIDTH > 400 ? 16 : 14,
    textAlign: 'center',
  },
});
