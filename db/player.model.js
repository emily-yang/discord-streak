const mongoose = require('mongoose');

const SchemaTypes = mongoose.Schema.Types;
const schema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  userName: String,
  highestStreak: {
    type: Number,
    default: 0,
  },
});

const Player = mongoose.model('player', schema);

module.exports = Player;
