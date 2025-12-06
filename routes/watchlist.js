const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');
const { auth } = require('../middleware/auth');

// Kullanıcının izleme listesini getir
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.user.userId };
    
    if (status) {
      filter.status = status;
    }

    const watchlist = await Watchlist.find(filter)
      .populate('seriesId')
      .sort({ priority: -1, addedAt: -1 });
    
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// İzleme listesine ekle
router.post('/', auth, async (req, res) => {
  try {
    const { seriesId, status, priority } = req.body;
    
    // Zaten listede mi kontrol et
    let watchlistItem = await Watchlist.findOne({ 
      userId: req.user.userId, 
      seriesId 
    });

    if (watchlistItem) {
      // Güncelle
      watchlistItem.status = status || watchlistItem.status;
      watchlistItem.priority = priority || watchlistItem.priority;
      watchlistItem.updatedAt = Date.now();
      await watchlistItem.save();
    } else {
      // Yeni ekle
      watchlistItem = new Watchlist({
        userId: req.user.userId,
        seriesId,
        status: status || 'plan_to_watch',
        priority: priority || 3
      });
      await watchlistItem.save();
    }

    const populated = await Watchlist.findById(watchlistItem._id).populate('seriesId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// İzleme listesinden çıkar
router.delete('/:seriesId', auth, async (req, res) => {
  try {
    await Watchlist.findOneAndDelete({ 
      userId: req.user.userId, 
      seriesId: req.params.seriesId 
    });
    res.json({ message: 'Listeden çıkarıldı' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Durum güncelle
router.put('/:seriesId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const watchlistItem = await Watchlist.findOneAndUpdate(
      { userId: req.user.userId, seriesId: req.params.seriesId },
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('seriesId');

    if (!watchlistItem) {
      return res.status(404).json({ message: 'Liste öğesi bulunamadı' });
    }

    res.json(watchlistItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// İstatistikler
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Watchlist.aggregate([
      { $match: { userId: req.user.userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const result = {
      plan_to_watch: 0,
      watching: 0,
      completed: 0,
      on_hold: 0,
      dropped: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
