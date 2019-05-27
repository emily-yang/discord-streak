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

  // RUN: used to create or alter tables and to insert or update table data
  async run(sql, params = []) {
    try {
      return await this.db.run(sql, params);
    } catch (err) {
      console.error('SQL error with ', sql);
      console.error(err);
    }
  }
}

module.exports = AppDAO;
