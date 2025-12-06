const express = require('express');
const router = express.Router();
const Cast = require('../models/Cast');
const SeriesCast = require('../models/SeriesCast');
const { auth, adminAuth } = require('../middleware/auth');

// Tüm oyuncuları/ekibi getir
router.get('/', async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const cast = await Cast.find(query).sort({ name: 1 });
    res.json(cast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tek oyuncu/ekip getir
router.get('/:id', async (req, res) => {
  try {
    const cast = await Cast.findById(req.params.id);
    if (!cast) {
      return res.status(404).json({ message: 'Kişi bulunamadı' });
    }

    // Bu kişinin oynadığı/çalıştığı diziler
    const series = await SeriesCast.find({ castId: req.params.id })
      .populate('seriesId', 'title poster releaseYear')
      .sort({ 'seriesId.releaseYear': -1 });

    res.json({ ...cast.toObject(), series });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Oyuncu/ekip ekle (Admin)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const cast = new Cast(req.body);
    await cast.save();
    res.status(201).json(cast);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Oyuncu/ekip güncelle (Admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const cast = await Cast.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cast) {
      return res.status(404).json({ message: 'Kişi bulunamadı' });
    }
    res.json(cast);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Oyuncu/ekip sil (Admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const cast = await Cast.findByIdAndDelete(req.params.id);
    if (!cast) {
      return res.status(404).json({ message: 'Kişi bulunamadı' });
    }
    
    // İlişkili kayıtları da sil
    await SeriesCast.deleteMany({ castId: req.params.id });
    
    res.json({ message: 'Kişi silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Diziye oyuncu/ekip ekle (Admin)
router.post('/series/:seriesId', auth, adminAuth, async (req, res) => {
  try {
    const { castId, role, characterName, order } = req.body;
    
    const seriesCast = new SeriesCast({
      seriesId: req.params.seriesId,
      castId,
      role,
      characterName,
      order
    });
    
    await seriesCast.save();
    const populated = await SeriesCast.findById(seriesCast._id)
      .populate('castId')
      .populate('seriesId', 'title');
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Dizinin oyuncu/ekibini getir
router.get('/series/:seriesId', async (req, res) => {
  try {
    const { role } = req.query;
    let query = { seriesId: req.params.seriesId };
    
    if (role) {
      query.role = role;
    }

    const cast = await SeriesCast.find(query)
      .populate('castId')
      .sort({ order: 1, 'castId.name': 1 });

    // Role göre grupla
    const grouped = {
      actors: [],
      directors: [],
      writers: [],
      producers: [],
      composers: [],
      cinematographers: []
    };

    cast.forEach(item => {
      if (item.role === 'actor') grouped.actors.push(item);
      else if (item.role === 'director') grouped.directors.push(item);
      else if (item.role === 'writer') grouped.writers.push(item);
      else if (item.role === 'producer') grouped.producers.push(item);
      else if (item.role === 'composer') grouped.composers.push(item);
      else if (item.role === 'cinematographer') grouped.cinematographers.push(item);
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Diziden oyuncu/ekip çıkar (Admin)
router.delete('/series/:seriesId/cast/:castId', auth, adminAuth, async (req, res) => {
  try {
    await SeriesCast.findOneAndDelete({
      seriesId: req.params.seriesId,
      castId: req.params.castId
    });
    res.json({ message: 'Kişi diziden çıkarıldı' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
