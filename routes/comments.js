const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { auth, adminAuth } = require('../middleware/auth');

// Fragmana ait yorumları getir
router.get('/trailer/:trailerId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      trailerId: req.params.trailerId,
      parentId: null // Sadece ana yorumlar
    })
      .populate('userId', 'username profilePhoto')
      .populate({
        path: 'parentId',
        populate: { path: 'userId', select: 'username' }
      })
      .sort({ createdAt: -1 });
    
    // Her yorum için yanıtları getir
    for (let comment of comments) {
      const replies = await Comment.find({ parentId: comment._id })
        .populate('userId', 'username profilePhoto')
        .sort({ createdAt: 1 });
      comment._doc.replies = replies;
    }

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yorum ekle
router.post('/', auth, async (req, res) => {
  try {
    const comment = new Comment({
      ...req.body,
      userId: req.user.userId
    });
    await comment.save();
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username profilePhoto');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Yorumu beğen/beğenmekten vazgeç
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    const userId = req.user.userId;
    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Beğeniyi kaldır
      comment.likes.splice(likeIndex, 1);
    } else {
      // Beğen
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ likes: comment.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Yorum sil (Kendi yorumu veya Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Yorum bulunamadı' });
    
    if (comment.userId.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkiniz yok' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Yorum silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
