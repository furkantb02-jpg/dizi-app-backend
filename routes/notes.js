const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { auth } = require('../middleware/auth');

// Kullanıcının notlarını getir
router.get('/', auth, async (req, res) => {
  try {
    const { seriesId, episodeId } = req.query;
    const filter = { userId: req.user.userId };
    
    if (seriesId) filter.seriesId = seriesId;
    if (episodeId) filter.episodeId = episodeId;

    const notes = await Note.find(filter)
      .populate('seriesId', 'title')
      .populate('episodeId', 'title season episodeNumber')
      .sort({ updatedAt: -1 });
    
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tek not getir
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    })
      .populate('seriesId', 'title')
      .populate('episodeId', 'title season episodeNumber');

    if (!note) {
      return res.status(404).json({ message: 'Not bulunamadı' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Not ekle
router.post('/', auth, async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      userId: req.user.userId
    });
    
    await note.save();
    const populated = await Note.findById(note._id)
      .populate('seriesId', 'title')
      .populate('episodeId', 'title season episodeNumber');
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Not güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    )
      .populate('seriesId', 'title')
      .populate('episodeId', 'title season episodeNumber');

    if (!note) {
      return res.status(404).json({ message: 'Not bulunamadı' });
    }

    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Not sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });

    if (!note) {
      return res.status(404).json({ message: 'Not bulunamadı' });
    }

    res.json({ message: 'Not silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Not ara
router.get('/search/:query', auth, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.userId,
      $or: [
        { title: { $regex: req.params.query, $options: 'i' } },
        { content: { $regex: req.params.query, $options: 'i' } },
        { tags: { $in: [new RegExp(req.params.query, 'i')] } }
      ]
    })
      .populate('seriesId', 'title')
      .populate('episodeId', 'title season episodeNumber')
      .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
