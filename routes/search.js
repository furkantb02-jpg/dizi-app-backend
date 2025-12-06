const express = require('express');
const router = express.Router();
const SearchHistory = require('../models/SearchHistory');
const Series = require('../models/Series');
const { auth } = require('../middleware/auth');

// Arama yap ve geçmişe kaydet
router.get('/', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    // Aramayı geçmişe kaydet
    const searchHistory = new SearchHistory({
      userId: req.user.userId,
      query: q.trim()
    });
    await searchHistory.save();

    // Arama yap
    const results = await Series.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { genre: { $in: [new RegExp(q, 'i')] } }
      ]
    }).limit(20);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Arama geçmişini getir
router.get('/history', auth, async (req, res) => {
  try {
    const history = await SearchHistory.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('query createdAt');
    
    // Tekrar edenleri temizle
    const uniqueQueries = [];
    const seen = new Set();
    
    for (const item of history) {
      if (!seen.has(item.query)) {
        seen.add(item.query);
        uniqueQueries.push(item);
      }
    }

    res.json(uniqueQueries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Arama geçmişini temizle
router.delete('/history', auth, async (req, res) => {
  try {
    await SearchHistory.deleteMany({ userId: req.user.userId });
    res.json({ message: 'Arama geçmişi temizlendi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Popüler aramalar
router.get('/popular', async (req, res) => {
  try {
    const popular = await SearchHistory.aggregate([
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { query: '$_id', count: 1, _id: 0 } }
    ]);

    res.json(popular);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
