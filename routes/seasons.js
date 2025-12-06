const express = require('express');
const router = express.Router();
const Episode = require('../models/Episode');
const WatchHistory = require('../models/WatchHistory');
const { auth } = require('../middleware/auth');

// Dizinin sezonlarını getir
router.get('/series/:seriesId', async (req, res) => {
  try {
    const seasons = await Episode.aggregate([
      { $match: { seriesId: req.params.seriesId } },
      { 
        $group: { 
          _id: '$season',
          episodeCount: { $sum: 1 },
          episodes: { $push: '$$ROOT' }
        } 
      },
      { $sort: { _id: 1 } },
      { 
        $project: {
          season: '$_id',
          episodeCount: 1,
          episodes: {
            $sortArray: {
              input: '$episodes',
              sortBy: { episodeNumber: 1 }
            }
          }
        }
      }
    ]);

    res.json(seasons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sezon istatistikleri
router.get('/series/:seriesId/season/:seasonNumber/stats', auth, async (req, res) => {
  try {
    const { seriesId, seasonNumber } = req.params;
    
    // Sezondaki tüm bölümler
    const episodes = await Episode.find({ 
      seriesId, 
      season: parseInt(seasonNumber) 
    });

    // Kullanıcının izlediği bölümler
    const watchedEpisodes = await WatchHistory.find({
      userId: req.user.userId,
      seriesId,
      episodeId: { $in: episodes.map(e => e._id) },
      completed: true
    });

    const totalEpisodes = episodes.length;
    const watchedCount = watchedEpisodes.length;
    const progress = totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;

    res.json({
      season: parseInt(seasonNumber),
      totalEpisodes,
      watchedEpisodes: watchedCount,
      progress: Math.round(progress),
      isCompleted: watchedCount === totalEpisodes && totalEpisodes > 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tüm sezonların istatistikleri
router.get('/series/:seriesId/all-stats', auth, async (req, res) => {
  try {
    const { seriesId } = req.params;
    
    // Tüm bölümleri sezonlara göre grupla
    const seasonGroups = await Episode.aggregate([
      { $match: { seriesId: mongoose.Types.ObjectId(seriesId) } },
      { 
        $group: { 
          _id: '$season',
          episodes: { $push: '$_id' },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = [];

    for (const group of seasonGroups) {
      const watchedCount = await WatchHistory.countDocuments({
        userId: req.user.userId,
        seriesId,
        episodeId: { $in: group.episodes },
        completed: true
      });

      const progress = (watchedCount / group.count) * 100;

      stats.push({
        season: group._id,
        totalEpisodes: group.count,
        watchedEpisodes: watchedCount,
        progress: Math.round(progress),
        isCompleted: watchedCount === group.count
      });
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
