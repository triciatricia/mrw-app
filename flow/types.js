// Flow type aliases
/* @flow */

export type ImageUrl = {
  url: string,
  id: number,
  prefetched?: boolean,
  localUri?: string,
};

export type GameInfo = {
  id: number,
  round: ?number,
  image: ?ImageUrl,
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
  imageQueue: ?Array<ImageUrl>,
  responsesIn: number,
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
