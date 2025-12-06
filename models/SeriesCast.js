const mongoose = require('mongoose');

const seriesCastSchema = new mongoose.Schema({
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: true
  },
  castId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cast',
    required: true
  },
  role: {
    type: String,
    enum: ['actor', 'director', 'writer', 'producer', 'composer', 'cinematographer'],
    required: true
  },
  characterName: String, // Oyuncu için karakter adı
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

seriesCastSchema.index({ seriesId: 1, castId: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('SeriesCast', seriesCastSchema);
