/* @flow */
// Functions dealing with loading and saving data to the sqlite file.

import {SQLite} from 'expo';

class Database {
  db: Object;

  constructor() {
    this.db = SQLite.openDatabase('db.db');
  }

  initializeTables(
    cb: (err: string | Error) => void
  ): void {
    // Create sqlite tables if they haven't been created.
    this.db.transaction(
      tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS info (key TEXT PRIMARY KEY, value TEXT);',
          [],
          (tx, res) => {
            tx.executeSql(
              ('INSERT OR IGNORE INTO info VALUES ("gameInfo", null), ' +
                '("playerInfo", null), ("errorMessage", null), ("pushToken", null), ("newInstall", "true"), ("imageCache", null);')
            );
          },
          (tx, err) => {
            cb(err);
          });
      },
      cb);
  }

  loadSavedStateAsync(): Promise<Object> {
    return new Promise((resolve, reject) => {
      // Load the saved state of the app from the SQLite database.
      this.db.transaction(
        tx => {
          tx.executeSql(
            'SELECT * FROM info',
            [],
            (tx, res) => {
              let savedVals = {}
              try {
                for (const row in res.rows._array) {
                  savedVals[res.rows._array[row].key] = JSON.parse(res.rows._array[row].value);
                }
              } catch (err) {
                console.log('Error processing saved data.');
                reject(err);
              }

              console.log('Loading saved state');
              console.log(savedVals);

              resolve(savedVals);
            },
            (tx, err) => {
              console.log('No saved state.');
              resolve({});
            }
          );
      },
      err => {
        reject(err);
      });
    });
  }

  updateSavedInfo(
    key: string,
    value: ?Object | string | number | boolean,
  ) {
    this.db.transaction(
      tx => {
        tx.executeSql(
          'UPDATE info SET value=? WHERE key=?',
          [JSON.stringify(value), key],
          (tx, res) => {},
          (tx, err) => {console.log('Error saving state.')});
      });
  }
}

export default Database;
