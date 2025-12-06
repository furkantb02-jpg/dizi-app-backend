const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'Dizi App API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      series: '/api/series',
      episodes: '/api/episodes',
      trailers: '/api/trailers',
      comments: '/api/comments',
      favorites: '/api/favorites',
      watchHistory: '/api/watch-history',
      ratings: '/api/ratings',
      users: '/api/users'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend çalışıyor',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    env: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'NOT SET',
      MONGODB_URI: process.env.MONGODB_URI ? 'set' : 'NOT SET',
      PORT: process.env.PORT || 5000
    },
    mongodb: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host || 'not connected'
    }
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/series', require('./routes/series'));
app.use('/api/episodes', require('./routes/episodes'));
app.use('/api/trailers', require('./routes/trailers'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/watch-history', require('./routes/watchHistory'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/users', require('./routes/users'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
