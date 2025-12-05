const express = require('express');
const router = express.Router();
const Episode = require('../models/Episode');
const { auth, adminAuth } = require('../middleware/auth');

// Diziye ait bölümleri getir
router.get('/series/:seriesId', async (req, res) => {
  try {
    const episodes = await Episode.find({ seriesId: req.params.seriesId }).sort({ season: 1, episodeNumber: 1 });
    res.json(episodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bölüm ekle (Admin)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const episode = new Episode(req.body);
    await episode.save();
    res.status(201).json(episode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bölüm güncelle (Admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const episode = await Episode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(episode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bölüm sil (Admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Episode.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bölüm silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
