const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { auth, adminAuth } = require('../middleware/auth');

// Fragmana ait yorumları getir
router.get('/trailer/:trailerId', async (req, res) => {
  try {
    const comments = await Comment.find({ trailerId: req.params.trailerId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
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
    const populatedComment = await Comment.findById(comment._id).populate('userId', 'username');
    res.status(201).json(populatedComment);
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
