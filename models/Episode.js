const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  episodeNumber: {
    type: Number,
    required: true
  },
  season: {
    type: Number,
    required: true
  },
  description: String,
  thumbnail: String,
  videoUrl: String,
  duration: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Episode', episodeSchema);
