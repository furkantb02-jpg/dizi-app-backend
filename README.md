# Dizi App Backend

## Kurulum

1. Bağımlılıkları yükle:
```bash
cd backend
npm install
```

2. `.env` dosyası oluştur (`.env.example` dosyasını kopyala)

3. MongoDB'yi başlat

4. Sunucuyu çalıştır:
```bash
npm run dev
```

## API Endpoints

### Auth
- POST `/api/auth/register` - Kayıt
- POST `/api/auth/login` - Giriş

### Diziler
- GET `/api/series` - Tüm diziler
- GET `/api/series/:id` - Tek dizi
- POST `/api/series` - Dizi ekle (Admin)
- PUT `/api/series/:id` - Dizi güncelle (Admin)
- DELETE `/api/series/:id` - Dizi sil (Admin)

### Bölümler
- GET `/api/episodes/series/:seriesId` - Diziye ait bölümler
- POST `/api/episodes` - Bölüm ekle (Admin)
- PUT `/api/episodes/:id` - Bölüm güncelle (Admin)
- DELETE `/api/episodes/:id` - Bölüm sil (Admin)

### Fragmanlar
- GET `/api/trailers` - Tüm fragmanlar
- GET `/api/trailers/series/:seriesId` - Diziye ait fragmanlar
- POST `/api/trailers` - Fragman ekle (Admin)
- PUT `/api/trailers/:id` - Fragman güncelle (Admin)
- DELETE `/api/trailers/:id` - Fragman sil (Admin)

### Yorumlar
- GET `/api/comments/trailer/:trailerId` - Fragmana ait yorumlar
- POST `/api/comments` - Yorum ekle
- DELETE `/api/comments/:id` - Yorum sil
