const mongoose = require('mongoose');

const schema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  userName: String,
  maxStreak: {
    type: Number,
    default: 0,
  },
  streakMatches: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: 'report',
  },
});

schema.index({ userId: 1 });
schema.index({ userId: 1, maxStreak: -1 });

const Player = mongoose.model('player', schema);

module.exports = Player;
