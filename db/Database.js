require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('./player.model');
const Match = require('./report.model');

class Database {
  constructor(dbName) {
    if (!dbName) this.dbName = 'discord-streak';
    else this.dbName = dbName;
    this.conn = null;
    this.connected = false;
  }

  connect() {
    mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${
        this.dbName
      }?retryWrites=true`,
      { useNewUrlParser: true }
    );

    this.conn = mongoose.connection;
    this.conn.on('connected', () => {
      this.connected = true;
      console.log(`Connected to database ${this.dbName}`);
    });
    this.conn.on('error', console.error.bind(console, 'MongoDB connection error:'));
  }

  disconnect() {
    this.conn.close();
    this.connected = false;
    console.log('Disconnected from database');
  }
}

module.exports = Database;
