// Tüm kullanıcıları sil
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://diziapp:DiziApp2024@cluster0.mybvbng.mongodb.net/dizi-app?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB bağlantısı başarılı');
    
    const User = require('./models/User');
    
    const result = await User.deleteMany({});
    console.log(`✅ ${result.deletedCount} kullanıcı silindi!`);
    console.log('Şimdi uygulamadan kayıt ol!');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Hata:', err);
    process.exit(1);
  });
