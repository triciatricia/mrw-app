module.exports.postToServer = async (data) => {
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
    let res = await response.json();
    return res;
  } catch(error) {
    return {errorMessage: 'Error communicating with server'};
  }
};
