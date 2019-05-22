/* eslint-disable spaced-comment */
require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('./player.model');
const Report = require('./report.model');

class Database {
  constructor(dbName) {
    if (!dbName) this.dbName = 'discord-streak';
    else this.dbName = dbName;
    this.conn = null;
    this.connected = false;
  }

  /********************
   *    Connections   *
   ********************/
  connect() {
    mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${
        this.dbName
      }?retryWrites=true`,
      { useNewUrlParser: true, useFindAndModify: false }
    );

    this.conn = mongoose.connection;
    this.conn.on('connected', () => {
      this.connected = true;
      // console.log(`Connected to database ${this.dbName}`);
    });
    this.conn.on('error', console.error.bind(console, 'MongoDB connection error:'));
  }

  disconnect() {
    this.conn.close();
    this.connected = false;
    console.log('Disconnected from database');
  }

  /****************
   *    Players   *
   ***************/

  async addPlayer(userId, userName) {
    if (!this.connected) {
      this.connect();
    }
    try {
      return await Player.create({ userId, userName });
    } catch (err) {
      console.error(err);
    }
  }

  async getPlayer(userId) {
    if (!this.connected) {
      this.connect();
    }
    try {
      return await Player.findOne({ userId });
    } catch (err) {
      console.error(err);
    }
  }

  async getSortedPlayers() {
    if (!this.connected) {
      this.connect();
    }
    try {
      return await Player.find().sort({ maxStreak: -1 });
    } catch (err) {
      console.error(err);
    }
  }

  async incPlayerMaxStreak(userId, reportId) {
    if (!this.connected) {
      this.connect();
    }
    try {
      return await Player.findOneAndUpdate({ userId }, { $inc: { maxStreak: 1 }, $push: { streakMatches: reportId } });
    } catch (err) {
      console.error(err);
    }
  }

  async decPlayerMaxStreak(userId) {
    if (!this.connected) {
      this.connect();
    }
    try {
      // eslint-disable-next-line prettier/prettier
      return await Player.findOneAndUpdate(
        { userId },
        { $inc: { maxStreak: -1 } ,
         $pop: { streakMatches: 1 } });
    } catch (err) {
      console.error(err);
    }
  }

  /****************
   *    Reports   *
   ***************/

  async getReports() {
    if (!this.connected) {
      this.connect();
    }
    try {
      return await Report.find().sort({ timestamp: -1 });
    } catch (err) {
      console.error(err);
    }
  }

  async getLastReport() {
    if (!this.connected) {
      this.connect();
    }
    try {
      return await Report.findOne().sort({ timestamp: -1 });
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
      const lastReport = await this.getLastReport();
      // if same winner, increment current streak
      // else set current streak to 1
      const streak = lastReport && userId === lastReport.winner.userId ? lastReport.streak + 1 : 1;
      // add report
      return await Report.create({ winner: { userId, userName }, reportedBy, streak });
    } catch (err) {
      console.error(err);
    }
  }

  async deleteLastReport() {
    if (!this.connected) {
      this.connect();
    }
    try {
      return await Report.findOneAndDelete({}, { sort: { _id: -1 } });
    } catch (err) {
      console.error(err);
    }
  }

  /***************
   *    Resets   *
   **************/

  async resetStandings() {
    if (!this.connected) {
      this.connect();
    }
    try {
      await Player.updateMany({}, { maxStreak: 0, streakMatches: [] });
      await this.conn.db.dropCollection('reports', (err, result) => {
        if (err) console.error(err);
      });
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = Database;
