const sqlite3 = require('sqlite3');

/*
RUN: used to create or alter tables and to insert or update table data
GET: select a single row of data from one or more tables
ALL: select multiple rows of data from one or more tables
 */

class AppDAO {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, err => {
      if (err) console.error('Could not connect to database', err);
      else console.log('Connected to database');
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.log(`Error running sql ${sql}`);
          console.log(err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.log(`Error running sql: ${sql}`);
          console.log(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.log(`Error running sql: ${sql}`);
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = AppDAO;
