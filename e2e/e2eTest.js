const { reloadApp } = require('detox-expo-helpers');

import fetch from 'isomorphic-fetch';
import {postToServerPromise} from '../libraries/networking';


describe('MRW', () => {
  beforeEach(async () => {
    await reloadApp();
  });

  it('should let you play the game', async () => {
    await waitFor(element(by.id('NewGame'))).toBeVisible().withTimeout(2000);

    // Try to join a non-existent game
    await waitFor(element(by.id('JoinGameButton'))).toBeVisible().withTimeout(2000);
    await expect(element(by.id('JoinGameButton'))).toBeVisible();
    await element(by.id('JoinGameButton')).tap();

    // Create a game (not using the simulator)
    const {gameID, player1ID, player2ID} = await createGame();

    // Join the game
    console.log('Joining game');
    await element(by.id('GameCodeTextInput')).tap();
    await element(by.id('GameCodeTextInput')).typeText('' + gameID);
    await element(by.id('JoinGameButton')).tap();
    await waitFor(element(by.id('NicknameTextInput'))).toBeVisible().withTimeout(2000);
    await element(by.id('NicknameTextInput')).tap();
    await element(by.id('NicknameTextInput')).typeText('iOS simulator');
    await element(by.id('SubmitNicknameButton')).tap();
    await waitFor(element(by.id('WaitingToStart'))).toBeVisible().withTimeout(2000);
    await waitFor(element(by.id('GameCode'))).toBeVisible().withTimeout(2000);
    await expect(element(by.id('GameCode'))).toBeVisible();
    await expect(element(by.id('PlayersJoinedMessage'))).toBeVisible();

    // Start game
    console.log('Starting game');
    let res = await postToServerPromise({
      gameID: gameID,
      playerID: player1ID,
      action: 'startGame',
      appIsActive: true,
    });

    // Submit a response
    console.log('Submitting responses');
    await waitFor(element(by.id('GamePlay'))).toBeVisible().withTimeout(4000);
    await expect(element(by.id('GamePlay'))).toBeVisible();
    await expect(element(by.id('GifView'))).toBeVisible();
    await expect(element(by.id('TimeLeft'))).toBeVisible();
    await element(by.id('ScenarioTextInput')).tap();
    await element(by.id('ScenarioTextInput')).typeText('A Good Answer');
    await element(by.id('ScenarioSubmissionButton')).tap();
    await waitFor(element(by.id('ScenarioHelpMessage'))).toBeVisible().withTimeout(2000);
    await element(by.id('ScenarioTextInput')).tap();
    await expect(element(by.id('TimeLeftTopBar'))).toBeVisible(); // works in iOS only
    await element(by.id('ScenarioTextInput')).replaceText('The Best Answer');
    await element(by.id('ScenarioSubmissionButton')).tap();

    res = await postToServerPromise({
      gameID: gameID,
      playerID: player2ID,
      action: 'submitResponse',
      appIsActive: true,
      round: 1,
      response: 'Player2\'s Response 😋',
    });

    await waitFor(element(by.id('ScenarioList'))).toBeVisible().withTimeout(4000);
    await expect(element(by.id('ScenarioList'))).toBeVisible();

    console.log('Choosing scenario');
    res = await postToServerPromise({
      gameID: gameID,
      playerID: player1ID,
      action: 'chooseScenario',
      appIsActive: true,
      round: 1,
      choiceID: '_0',
    });

    console.log('Going to next round');
    // It should be Player2's turn to be the reactor.
    res = await postToServerPromise({
      gameID: gameID,
      playerID: player1ID,
      action: 'nextRound',
      appIsActive: true,
    });

    res = await postToServerPromise({
      gameID: gameID,
      playerID: player1ID,
      action: 'submitResponse',
      appIsActive: true,
      round: 2,
      response: 'Player1\'s Response 😋',
    });

    await waitFor(element(by.id('GamePlay'))).toBeVisible().withTimeout(4000);
    await waitFor(element(by.id('ScenarioTextInput'))).toBeVisible().withTimeout(4000);
    await element(by.id('ScenarioTextInput')).tap();
    await element(by.id('ScenarioTextInput')).typeText('Simulator\'s Response');
    await element(by.id('ScenarioSubmissionButton')).tap();

    await waitFor(element(by.id('ScenarioListForm'))).toBeVisible().withTimeout(4000);
    await expect(element(by.id('ScenarioListForm'))).toBeVisible();

    console.log('Choosing scenario');
    res = await postToServerPromise({
      gameID: gameID,
      playerID: player2ID,
      action: 'chooseScenario',
      appIsActive: true,
      round: 2,
      choiceID: '_0',
    });

    console.log('Going to next round');
    // It should be the simulator's turn to be the reactor.
    res = await postToServerPromise({
      gameID: gameID,
      playerID: player2ID,
      action: 'nextRound',
      appIsActive: true,
    });

    console.log('Skipping image');
    await waitFor(element(by.id('SkipImageButton'))).toBeVisible().withTimeout(4000);
    await element(by.id('SkipImageButton')).tap();

    res = await postToServerPromise({
      gameID: gameID,
      playerID: player1ID,
      action: 'submitResponse',
      appIsActive: true,
      round: 3,
      response: 'Player1\'s Response 😋',
    });

    res = await postToServerPromise({
      gameID: gameID,
      playerID: player2ID,
      action: 'submitResponse',
      appIsActive: true,
      round: 3,
      response: 'Player2\'s Response 😋',
    });

    await waitFor(element(by.id('ScenarioListForm'))).toBeVisible().withTimeout(4000);
    await expect(element(by.id('ScenarioListForm'))).toBeVisible();

    console.log('Choosing scenario');
    await waitFor(element(by.id('ScenarioList'))).toBeVisible().withTimeout(4000);
    await expect(element(by.id('ScenarioList'))).toBeVisible();
    await element(by.id('ReactionScenarioRadioButton')).atIndex(0).tap();
    await element(by.id('ChooseScenarioButton')).tap();

    await waitFor(element(by.id('NextRoundButton'))).toExist().withTimeout(4000);
    await expect(element(by.id('NextRoundButton'))).toExist();

    console.log('Ending game');
    await element(by.id('EndGameButton')).tap();

    await waitFor(element(by.id('ScoreTable'))).toBeVisible().withTimeout(4000);
    await expect(element(by.id('ScoreTable'))).toBeVisible();

    console.log('Leaving game');
    await expect(element(by.id('LeaveGameButton'))).toBeVisible();
    await element(by.id('LeaveGameButton')).tap();
    await waitFor(element(by.id('LeaveGameConfirmButton'))).toBeVisible().withTimeout(2000);
    await element(by.id('LeaveGameConfirmButton')).tap();

  });

  /*

  it('should show hello screen after tap', async () => {
    await element(by.id('hello_button')).tap();
    await expect(element(by.label('Hello!!!'))).toBeVisible();
  });

  it('should show world screen after tap', async () => {
    await element(by.id('world_button')).tap();
    await expect(element(by.label('World!!!'))).toBeVisible();
  });
  */
});

// Create a game with 2 players. Returns gameID, player1ID, player2ID.
const createGame = async () => {
  console.log('Creating game.');

  let res = await postToServerPromise({
    gameID: null,
    playerID: null,
    action: 'createNewGame',
    appIsActive: true,
  });

  const gameID = res.result.gameInfo.id;

  res = await postToServerPromise({
    gameID: gameID,
    playerID: null,
    action: 'createPlayer',
    appIsActive: true,
    nickname: 'Player1',
  });

  const player1ID = res.result.playerInfo.id;

  res = await postToServerPromise({
    gameID: null,
    playerID: null,
    action: 'joinGame',
    appIsActive: true,
    gameCode: gameID,
  });

  res = await postToServerPromise({
    gameID: gameID,
    playerID: null,
    action: 'createPlayer',
    appIsActive: true,
    nickname: 'Player2',
  });

  const player2ID = res.result.playerInfo.id;

  console.log(`Created game ${gameID} with player IDs: ${player1ID}, ${player2ID}`);

  return {gameID, player1ID, player2ID};
};
