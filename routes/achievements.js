const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const WatchHistory = require('../models/WatchHistory');
const Comment = require('../models/Comment');
const { auth } = require('../middleware/auth');

// Kullanıcının rozetlerini getir
router.get('/', auth, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.userId })
      .sort({ earnedAt: -1 });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rozet kontrolü ve kazanma
router.post('/check', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const newAchievements = [];
    const Rating = require('../models/Rating');
    const User = require('../models/User');
    const Note = require('../models/Note');
    const Episode = require('../models/Episode');

    // İlk izleme rozeti
    const watchCount = await WatchHistory.countDocuments({ userId, completed: true });
    if (watchCount === 1) {
      const exists = await Achievement.findOne({ userId, type: 'first_watch' });
      if (!exists) {
        const achievement = new Achievement({
          userId,
          type: 'first_watch',
          title: '🎬 İlk İzleme',
          description: 'İlk bölümünü tamamladın!',
          icon: '🎬'
        });
        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    // Maraton izleyici (10 bölüm)
    if (watchCount >= 10) {
      const exists = await Achievement.findOne({ userId, type: 'binge_watcher' });
      if (!exists) {
        const achievement = new Achievement({
          userId,
          type: 'binge_watcher',
          title: '🍿 Maraton İzleyici',
          description: '10 bölüm tamamladın!',
          icon: '🍿'
        });
        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    // Binge Master (50 bölüm)
    if (watchCount >= 50) {
      const exists = await Achievement.findOne({ userId, type: 'binge_master' });
      if (!exists) {
        const achievement = new Achievement({
          userId,
          type: 'binge_master',
          title: '🔥 Binge Master',
          description: '50 bölüm tamamladın!',
          icon: '🔥'
        });
        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    // Yorumcu (5 yorum)
    const commentCount = await Comment.countDocuments({ userId });
    if (commentCount >= 5) {
      const exists = await Achievement.findOne({ userId, type: 'commentator' });
      if (!exists) {
        const achievement = new Achievement({
          userId,
          type: 'commentator',
          title: '💬 Yorumcu',
          description: '5 yorum yaptın!',
          icon: '💬'
        });
        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    // Eleştirmen (50 puan)
    const ratingCount = await Rating.countDocuments({ userId });
    if (ratingCount >= 50) {
      const exists = await Achievement.findOne({ userId, type: 'super_critic' });
      if (!exists) {
        const achievement = new Achievement({
          userId,
          type: 'super_critic',
          title: '⭐ Süper Eleştirmen',
          description: '50 dizi puanladın!',
          icon: '⭐'
        });
        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    // Sosyal Kelebek (10 takip)
    const user = await User.findById(userId);
    if (user.following && user.following.length >= 10) {
      const exists = await Achievement.findOne({ userId, type: 'social_butterfly' });
      if (!exists) {
        const achievement = new Achievement({
          userId,
          type: 'social_butterfly',
          title: '🦋 Sosyal Kelebek',
          description: '10 kullanıcı takip ettin!',
          icon: '🦋'
        });
        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    // Not Tutucu (10 not)
    const noteCount = await Note.countDocuments({ userId });
    if (noteCount >= 10) {
      const exists = await Achievement.findOne({ userId, type: 'note_taker' });
      if (!exists) {
        const achievement = new Achievement({
          userId,
          type: 'note_taker',
          title: '📝 Not Tutucu',
          description: '10 not aldın!',
          icon: '📝'
        });
        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    // Sezon Bitirici - Bir sezonu tamamen bitir
    const completedSeasons = await WatchHistory.aggregate([
      { $match: { userId, completed: true } },
      { $lookup: { from: 'episodes', localField: 'episodeId', foreignField: '_id', as: 'episode' } },
      { $unwind: '$episode' },
      { $group: { 
          _id: { seriesId: '$episode.seriesId', season: '$episode.season' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (completedSeasons.length > 0) {
      // En az bir sezon tamamlanmış mı kontrol et
      for (const season of completedSeasons) {
        const totalEpisodes = await Episode.countDocuments({
          seriesId: season._id.seriesId,
          season: season._id.season
        });
        
        if (season.count === totalEpisodes) {
          const exists = await Achievement.findOne({ userId, type: 'season_finisher' });
          if (!exists) {
            const achievement = new Achievement({
              userId,
              type: 'season_finisher',
              title: '🏆 Sezon Bitirici',
              description: 'Bir sezonu tamamen bitirdin!',
              icon: '🏆'
            });
            await achievement.save();
            newAchievements.push(achievement);
            break;
          }
        }
      }
    }

    res.json({ newAchievements, total: newAchievements.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
