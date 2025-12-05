const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  trailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trailer',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema);
