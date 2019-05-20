const mongoose = require('mongoose');

const schema = mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  winner: {
    type: Object,
    ref: 'player',
  },
  reportedBy: {
    type: String,
    required: true,
    ref: 'player',
  },
  streak: {
    type: Number,
    default: 0,
  },
});

const Report = mongoose.model('report', schema);

module.exports = Report;
