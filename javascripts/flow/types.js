// Flow type aliases
/* @flow */

export type GameInfo = {
  id: number,
  round: ?number,
  image: ?string,
  waitingForScenarios: boolean,
  reactorID: ?number,
  reactorNickname: ?string,
  hostID: number,
  gameOver: boolean,
  winningResponse: ?string,
  winningResponseSubmittedBy: ?string,
  scores: Object,
  choices: Object,
  lastGif: ?string,
  displayOrder: ?string,
};

export type PlayerInfo = {
  id: number,
  nickname: string,
  accessToken: ?string,
  roundOfLastResponse: ?number,
  response: ?string,
  score: ?number,
  game: ?number,
  submittedScenario: ?boolean,
};
