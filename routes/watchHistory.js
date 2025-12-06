const express = require('express');
const router = express.Router();
const WatchHistory = require('../models/WatchHistory');
const { auth } = require('../middleware/auth');

// Kullanıcının izleme geçmişini getir
router.get('/', auth, async (req, res) => {
  try {
    const history = await WatchHistory.find({ userId: req.user.userId })
      .populate('episodeId')
      .populate('seriesId')
      .sort({ lastWatchedAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Belirli bir dizi için izleme geçmişi
router.get('/series/:seriesId', auth, async (req, res) => {
  try {
    const history = await WatchHistory.find({ 
      userId: req.user.userId,
      seriesId: req.params.seriesId
    }).populate('episodeId');
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// İzleme kaydı ekle/güncelle
router.post('/', auth, async (req, res) => {
  try {
    const { episodeId, seriesId, progress, completed } = req.body;
    
    let history = await WatchHistory.findOne({ 
      userId: req.user.userId, 
      episodeId 
    });

    if (history) {
      history.progress = progress;
      history.completed = completed;
      history.lastWatchedAt = Date.now();
      await history.save();
    } else {
      history = new WatchHistory({
        userId: req.user.userId,
        episodeId,
        seriesId,
        progress,
        completed
      });
      await history.save();
    }

    const populated = await WatchHistory.findById(history._id)
      .populate('episodeId')
      .populate('seriesId');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// İzleme kaydını sil
router.delete('/:episodeId', auth, async (req, res) => {
  try {
    await WatchHistory.findOneAndDelete({ 
      userId: req.user.userId, 
      episodeId: req.params.episodeId 
    });
    res.json({ message: 'İzleme kaydı silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
