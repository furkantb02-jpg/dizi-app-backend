// Render MongoDB'den tüm kullanıcıları sil
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://diziapp:DiziApp2024@cluster0.mybvbng.mongodb.net/dizi-app?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB bağlantısı başarılı');
    
    const User = require('./models/User');
    
    const count = await User.countDocuments();
    console.log(`📊 Mevcut kullanıcı sayısı: ${count}`);
    
    if (count > 0) {
      const result = await User.deleteMany({});
      console.log(`🗑️  ${result.deletedCount} kullanıcı silindi!`);
    } else {
      console.log('✅ Zaten kullanıcı yok!');
    }
    
    console.log('\n🎯 Şimdi uygulamadan kayıt ol!');
    console.log('   Email: admin@test.com');
    console.log('   Şifre: 123456');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Hata:', err.message);
    process.exit(1);
  });
