const mongoose = require('mongoose');

const castSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  photo: String,
  biography: String,
  birthDate: Date,
  nationality: String,
  socialMedia: {
    instagram: String,
    twitter: String,
    imdb: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cast', castSchema);
