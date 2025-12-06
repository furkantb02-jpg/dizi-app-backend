const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { auth } = require('../middleware/auth');

// Kullanıcının favorilerini getir
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.userId })
      .populate('seriesId')
      .sort({ createdAt: -1 });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favorilere ekle
router.post('/', auth, async (req, res) => {
  try {
    const { seriesId } = req.body;
    
    // Zaten favoride mi kontrol et
    const existing = await Favorite.findOne({ 
      userId: req.user.userId, 
      seriesId 
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Dizi zaten favorilerde' });
    }

    const favorite = new Favorite({
      userId: req.user.userId,
      seriesId
    });
    
    await favorite.save();
    const populated = await Favorite.findById(favorite._id).populate('seriesId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Favorilerden çıkar
router.delete('/:seriesId', auth, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ 
      userId: req.user.userId, 
      seriesId: req.params.seriesId 
    });
    res.json({ message: 'Favorilerden çıkarıldı' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dizi favoride mi kontrol et
router.get('/check/:seriesId', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ 
      userId: req.user.userId, 
      seriesId: req.params.seriesId 
    });
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
