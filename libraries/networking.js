export const postToServerPromise = async (data) => {
  // Send game info to the server
  // res is an object with keys 'errorMessage' and 'result'.
  // res = {errorMessage: ..., result: {playerInfo: ..., gameInfo: ...}}
  try {
    let response = await fetch('http://192.241.187.67:4000/api/game', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    return {errorMessage: 'Error communicating with server'};
  }
};

export const invalidState = (res, action, postData, gameInfo, playerInfo) => {
   // Compare the result from a network message to current state
  if (!res.hasOwnProperty('result')) {
    return true;
  }
  if (
    action != 'leaveGame' &&
    res.result.gameInfo &&
    gameInfo != null &&
    gameInfo.hasOwnProperty('id') &&
    (!res.result.gameInfo.hasOwnProperty('id') ||
     res.result.gameInfo.id != gameInfo.id)
  ) {
    return true;
  }
  if (res.result.hasOwnProperty('playerInfo') &&
      playerInfo != null && playerInfo.hasOwnProperty('id') &&
      action != 'logOut' && action != 'leaveGame' && res.result.playerInfo != null) {
    if (!res.result.playerInfo.hasOwnProperty('id') || res.result.playerInfo.id != playerInfo.id) {
      return true;
    }
  }
  if (gameInfo == null && res.result.gameInfo &&
      action != 'joinGame' && action != 'createNewGame') {
    return true;
  }
  // Check if the gif is older.
  if (res.result.hasOwnProperty('gameInfo') &&
    res.result.gameInfo != null &&
    res.result.gameInfo.hasOwnProperty('image') &&
    gameInfo != null &&
    gameInfo.hasOwnProperty('image') &&
    res.result.gameInfo.image != null &&
    gameInfo.image != null &&
    res.result.gameInfo.image.id < gameInfo.image.id &&
    (action !== 'skipImage' || (postData.image &&
      postData.image.id !== res.result.gameInfo.image.id))) {
    return true;
  }
  return false;
};
