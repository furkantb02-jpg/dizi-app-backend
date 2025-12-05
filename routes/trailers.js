const express = require('express');
const router = express.Router();
const Trailer = require('../models/Trailer');
const { auth, adminAuth } = require('../middleware/auth');

// Tüm fragmanları getir
router.get('/', async (req, res) => {
  try {
    const trailers = await Trailer.find().populate('seriesId').sort({ createdAt: -1 });
    res.json(trailers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Diziye ait fragmanları getir
router.get('/series/:seriesId', async (req, res) => {
  try {
    const trailers = await Trailer.find({ seriesId: req.params.seriesId });
    res.json(trailers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fragman ekle (Admin)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const trailer = new Trailer(req.body);
    await trailer.save();
    res.status(201).json(trailer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fragman güncelle (Admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const trailer = await Trailer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(trailer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fragman sil (Admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Trailer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fragman silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
