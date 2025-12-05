const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Kayıt
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Kullanıcı zaten mevcut' });
    }

    // İlk kullanıcı otomatik admin olur
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword,
      isAdmin: isFirstUser // İlk kullanıcı admin
    });
    await user.save();

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, username, email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: 'Kayıt hatası', error: error.message });
  }
});

// Giriş
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz şifre' });
    }

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: 'Giriş hatası', error: error.message });
  }
});

// Kullanıcıyı admin yap (sadece geliştirme için)
router.post('/make-admin', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    user.isAdmin = true;
    await user.save();

    res.json({ message: `${user.username} artık admin!`, user: { id: user._id, username: user.username, email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: 'Hata', error: error.message });
  }
});

module.exports = router;
