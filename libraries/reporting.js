/* @flow */
// Functions dealing with error reports (with Sentry)

import Sentry from 'sentry-expo';

import type {GameInfo, PlayerInfo} from '../flow/types';

type State = {
  playerInfo: ?PlayerInfo,
  gameInfo: ?GameInfo,
  errorMessage: ?string,
  settingsVisible: boolean
};

export function redactPlayerInfo(playerInfo: ?PlayerInfo): PlayerInfo {
  // Remove the response (for privacy).
  let redactedPlayerInfo = Object.assign({}, playerInfo);
  if (redactedPlayerInfo.hasOwnProperty('response') && redactedPlayerInfo.response) {
    redactedPlayerInfo.response = 'hidden';
  }
  return redactedPlayerInfo;
}

export function redactGameInfo(gameInfo: ?GameInfo): GameInfo {
  // Remove choices (for privacy).
  let redactedGameInfo = Object.assign({}, gameInfo);

  if (gameInfo && redactedGameInfo.hasOwnProperty('choices') && redactedGameInfo.choices) {
    redactedGameInfo.choices = Object.assign({}, gameInfo.choices);
    for (let i in redactedGameInfo.choices) {
      redactedGameInfo.choices[i] = 'hidden';
    }
  }

  return redactedGameInfo;
}

export function redactedStateData(
  state: State
): State {
  return {
    playerInfo: redactPlayerInfo(state.playerInfo),
    gameInfo: redactGameInfo(state.gameInfo),
    errorMessage: state.errorMessage,
    settingsVisible: state.settingsVisible
  };
}

export function redactedRes(
  res: Object
): Object {
  // Hides private info from the result from posting to the server.
  let redactedResData = Object.assign({}, res);

  if (redactedResData.hasOwnProperty('result')) {
    redactedResData.result = Object.assign({}, res.result);
    if (res.result.hasOwnProperty('playerInfo')) {
      redactedResData.playerInfo = redactPlayerInfo(redactedResData.playerInfo);
    }
    if (res.result.hasOwnProperty('gameInfo')) {
      redactedResData.gameInfo = redactGameInfo(redactedResData.gameInfo);
    }
  }

  return redactedResData;
}

export function setSentryContext(state: State): void {
  Sentry.setUserContext({
    id: state.playerInfo && state.playerInfo.hasOwnProperty('id') ? state.playerInfo.id : null
  });
  Sentry.setExtraContext(redactedStateData(state));
}

export function reportError(errorMessage: string, state: State): void {
  setSentryContext(state);
  Sentry.captureMessage('Error message set: ' + errorMessage, {
    level: 'info'
  });
}

export function captureMessage(
  message: string,
  state: State,
  level: 'info' | 'warning' = 'info',
  extraInfo: Object
): void {
  setSentryContext(state);
  Sentry.captureMessage(message, {
    level: level,
    extra: extraInfo
  });
}

export function logAction(
  action: string,
  state: State
): void {
  setSentryContext(state);

  if (action === 'submitResponse' || action === 'joinGame' || action === 'leaveGame' || action === 'skipImage') {
    Sentry.captureMessage('postToServer action: ' + action, {
      level: 'info',
      tags: {type: 'postToServer_action'}
    });
  } else if (action !== 'getGameInfo') {
    Sentry.captureBreadcrumb({
      message: 'postToServer action: ' + action,
      category: 'action',
      data: redactedStateData(state)
    });
  }
}
