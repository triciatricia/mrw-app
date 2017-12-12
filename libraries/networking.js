// @flow
// Functions for communicating with the MRW server.
import CONF from '../constants/conf';

import type {GameInfo, PlayerInfo, ServerPostData, ServerResult} from '../flow/types';

export const postToServerPromise = async (data: ServerPostData): Promise<ServerResult> => {
  // Send game info to the server
  // res is an object with keys 'errorMessage' and 'result'.
  // res = {errorMessage: ..., result: {playerInfo: ..., gameInfo: ...}}
  // Passes errors on - does not catch them.
  let response = await Promise.race([
    fetch(CONF.MRW_SERVER, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }),
    new Promise((resolve, reject) => setTimeout(() => reject('Timeout'), 10000))
  ]);
  return await response.json();
};

export const invalidState = (
  res: ServerResult,
  action: string,
  postData: ServerPostData,
  gameInfo: ?GameInfo,
  playerInfo: ?PlayerInfo,
) => {
   // Compare the result from a network message to current state
  if (!res.result) {
    return true;
  }
  const newGameInfo = res.result.gameInfo;
  const newPlayerInfo = res.result.playerInfo;

  // Check if game and player IDs match
  if (action != 'leaveGame' && newGameInfo && gameInfo && newGameInfo.id !== gameInfo.id) {
    return true;
  }
  if (action != 'leaveGame' && newPlayerInfo && playerInfo && newPlayerInfo.id !== playerInfo.id) {
    return true;
  }

  // Check if game info is missing
  if (((gameInfo == null && newGameInfo) || (gameInfo && newGameInfo == null)) &&
      action != 'joinGame' && action != 'createNewGame' && action != 'leaveGame') {
    return true;
  }

  // Check if the gif is older.
  if (
    newGameInfo &&
    newGameInfo.image &&
    gameInfo &&
    gameInfo.image &&
    newGameInfo.image.id < gameInfo.image.id
  ) {
    return true;
  }

  return false;
};
