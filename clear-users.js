// Tüm kullanıcıları sil (sadece test için)
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB bağlantısı başarılı');
    
    const User = require('./models/User');
    
    const count = await User.countDocuments();
    console.log(`Mevcut kullanıcı sayısı: ${count}`);
    
    if (count > 0) {
      await User.deleteMany({});
      console.log('✅ Tüm kullanıcılar silindi!');
      console.log('Şimdi uygulamadan kayıt ol, ilk kullanıcı olarak admin olacaksın!');
    } else {
      console.log('✅ Zaten kullanıcı yok. Kayıt ol ve admin ol!');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Hata:', err);
    process.exit(1);
  });
