const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Bir kullanıcı aynı diziyi birden fazla favorilere ekleyemesin
favoriteSchema.index({ userId: 1, seriesId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
