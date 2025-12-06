const express = require('express');
const router = express.Router();
const WatchHistory = require('../models/WatchHistory');
const Favorite = require('../models/Favorite');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const { auth } = require('../middleware/auth');

// Kullanıcı istatistikleri
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // İzleme istatistikleri
    const totalWatched = await WatchHistory.countDocuments({ userId, completed: true });
    const inProgress = await WatchHistory.countDocuments({ userId, completed: false });
    
    // Favori sayısı
    const totalFavorites = await Favorite.countDocuments({ userId });
    
    // Yorum sayısı
    const totalComments = await Comment.countDocuments({ userId });
    
    // Verilen puan sayısı
    const totalRatings = await Rating.countDocuments({ userId });
    
    // Son izlenenler
    const recentlyWatched = await WatchHistory.find({ userId })
      .sort({ lastWatchedAt: -1 })
      .limit(5)
      .populate('seriesId', 'title')
      .populate('episodeId', 'title season episodeNumber');

    // Bu hafta izlenenler
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const watchedThisWeek = await WatchHistory.countDocuments({
      userId,
      lastWatchedAt: { $gte: weekAgo }
    });

    res.json({
      totalWatched,
      inProgress,
      totalFavorites,
      totalComments,
      totalRatings,
      watchedThisWeek,
      recentlyWatched
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Genel istatistikler (tüm kullanıcılar)
router.get('/global', async (req, res) => {
  try {
    const User = require('../models/User');
    const Series = require('../models/Series');
    
    const totalUsers = await User.countDocuments();
    const totalSeries = await Series.countDocuments();
    const totalComments = await Comment.countDocuments();
    
    // En popüler diziler (en çok favorilenen)
    const popularSeries = await Favorite.aggregate([
      { $group: { _id: '$seriesId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'series', localField: '_id', foreignField: '_id', as: 'series' } },
      { $unwind: '$series' },
      { $project: { title: '$series.title', count: 1 } }
    ]);

    // En çok izlenen diziler
    const mostWatched = await WatchHistory.aggregate([
      { $group: { _id: '$seriesId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'series', localField: '_id', foreignField: '_id', as: 'series' } },
      { $unwind: '$series' },
      { $project: { title: '$series.title', count: 1 } }
    ]);

    res.json({
      totalUsers,
      totalSeries,
      totalComments,
      popularSeries,
      mostWatched
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
