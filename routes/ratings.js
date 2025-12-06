const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Series = require('../models/Series');
const { auth } = require('../middleware/auth');

// Dizi için ortalama puanı getir
router.get('/series/:seriesId', async (req, res) => {
  try {
    const ratings = await Rating.find({ seriesId: req.params.seriesId });
    
    if (ratings.length === 0) {
      return res.json({ average: 0, count: 0 });
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / ratings.length;
    
    res.json({ 
      average: Math.round(average * 10) / 10, 
      count: ratings.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Kullanıcının bir dizi için verdiği puanı getir
router.get('/series/:seriesId/user', auth, async (req, res) => {
  try {
    const rating = await Rating.findOne({ 
      userId: req.user.userId, 
      seriesId: req.params.seriesId 
    });
    res.json(rating || { rating: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Puan ver/güncelle
router.post('/', auth, async (req, res) => {
  try {
    const { seriesId, rating } = req.body;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Puan 1-5 arasında olmalı' });
    }

    let userRating = await Rating.findOne({ 
      userId: req.user.userId, 
      seriesId 
    });

    if (userRating) {
      userRating.rating = rating;
      await userRating.save();
    } else {
      userRating = new Rating({
        userId: req.user.userId,
        seriesId,
        rating
      });
      await userRating.save();
    }

    // Dizinin ortalama puanını güncelle
    const ratings = await Rating.find({ seriesId });
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / ratings.length;
    
    await Series.findByIdAndUpdate(seriesId, { rating: average });

    res.json(userRating);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// En yüksek puanlı diziler
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topSeries = await Series.find()
      .sort({ rating: -1 })
      .limit(limit);
    res.json(topSeries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
