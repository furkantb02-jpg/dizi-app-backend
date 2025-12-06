const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: true
  },
  status: {
    type: String,
    enum: ['plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped'],
    default: 'plan_to_watch'
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

watchlistSchema.index({ userId: 1, seriesId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
