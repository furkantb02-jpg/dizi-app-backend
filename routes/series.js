const express = require('express');
const router = express.Router();
const Series = require('../models/Series');
const { auth, adminAuth } = require('../middleware/auth');

// Tüm dizileri getir
router.get('/', async (req, res) => {
  try {
    const series = await Series.find().sort({ createdAt: -1 });
    res.json(series);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tek dizi getir
router.get('/:id', async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) return res.status(404).json({ message: 'Dizi bulunamadı' });
    res.json(series);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dizi ekle (Admin)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const series = new Series(req.body);
    await series.save();
    res.status(201).json(series);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Dizi güncelle (Admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const series = await Series.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!series) return res.status(404).json({ message: 'Dizi bulunamadı' });
    res.json(series);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Dizi sil (Admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const series = await Series.findByIdAndDelete(req.params.id);
    if (!series) return res.status(404).json({ message: 'Dizi bulunamadı' });
    res.json({ message: 'Dizi silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
