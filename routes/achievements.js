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

    res.json({ newAchievements, total: newAchievements.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
