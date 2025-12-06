const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['first_watch', 'binge_watcher', 'commentator', 'social_butterfly', 'critic', 'early_adopter'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  icon: String,
  earnedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Achievement', achievementSchema);
