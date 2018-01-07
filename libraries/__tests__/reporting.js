// Jest tests for libraries/reporting.js.

import * as Reporting from '../reporting';

describe('redactPlayerInfo', () => {
  it('should remove responses', () => {
    const redactedPlayerInfo = Reporting.redactPlayerInfo({
      id: 1,
      nickname: 'abc',
      accessToken: null,
      roundOfLastResponse: 1,
      response: 'def',
      score: 2,
      game: 1,
      submittedScenario: true,
    });
    const expected = {
      id: 1,
      nickname: 'abc',
      accessToken: null,
      roundOfLastResponse: 1,
      response: 'hidden',
      score: 2,
      game: 1,
      submittedScenario: true,
    };
    expect(redactedPlayerInfo).toEqual(expected);
  });
});
