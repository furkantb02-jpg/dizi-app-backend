const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');

// Profil güncelle
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, profilePhoto, theme } = req.body;
    
    const updates = {};
    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;
    if (theme) updates.theme = theme;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Şifre değiştir
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Kullanıcı ara
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password').limit(20);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Kullanıcı profili getir
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', 'username profilePhoto')
      .populate('following', 'username profilePhoto');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Takip et
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Kendinizi takip edemezsiniz' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Zaten takip ediyor mu?
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'Zaten takip ediyorsunuz' });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'Takip edildi' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Takibi bırak
router.delete('/follow/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.userId;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== currentUserId
    );

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'Takip bırakıldı' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
