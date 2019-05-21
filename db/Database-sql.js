require('dotenv').config();

class Database {
  constructor(dbName) {
    if (!dbName) this.dbName = 'discord-streak';
    else this.dbName = dbName;
    this.conn = null;
    this.connected = false;
  }

  connect() {}

  disconnect() {}

  async addPlayer(userId, userName) {
    if (!this.connected) {
      this.connect();
    }
    try {
    } catch (err) {
      console.error(err);
    }
  }

  async findPlayer(userId) {
    if (!this.connected) {
      this.connect();
    }
    try {
    } catch (err) {
      console.error(err);
    }
  }

  async getSortedPlayers() {
    if (!this.connected) {
      this.connect();
    }
    try {
    } catch (err) {
      console.error(err);
    }
  }

  async updatePlayerMaxStreak(userId) {
    if (!this.connected) {
      this.connect();
    }
    try {
    } catch (err) {
      console.error(err);
    }
  }

  async getLastReport() {
    if (!this.connected) {
      this.connect();
    }
    try {
    } catch (err) {
      console.error(err);
    }
  }

  async addReport(userId, userName, reportedBy) {
    if (!this.connected) {
      this.connect();
    }
    try {
      // get winner from most recent report
      const lastReport = null;
      // if same winner, increment current streak
      // else set current streak to 1
      const streak = lastReport && userId === lastReport.winner.userId ? lastReport.streak + 1 : 1;
      // add report
    } catch (err) {
      console.error(err);
    }
  }

  async resetStandings() {
    if (!this.connected) {
      this.connect();
    }
    try {
      // set all player streaks to 0
      // drop reports
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = Database;
