# Telegram Clone

Bu loyiha Telegram messenger ilovasining klonidir. Real-time xabar almashish, media fayl yuborish, guruh chatlari va boshqa funksiyalarni o'z ichiga oladi.

## ✨ Xususiyatlar

- 📱 **Real-time messaging** - Socket.io orqali tezkor xabar almashish
- 🔐 **Telefon raqami bilan kirish** - SMS kod tasdiqsiz oddiy kirish
- 👤 **Profil boshqaruvi** - Avatar, ism, username va bio o'zgartirish
- 🖼️ **Rasm va video yuborish** - Media fayllarni yuklash va ko'rish
- 📄 **Hujjat yuborish** - PDF, DOC, ZIP va boshqa fayllar
- 🔍 **Qidiruv tizimi** - Foydalanuvchilar va xabarlarni qidirish
- 🟢 **Online/Offline status** - Foydalanuvchilarning holati
- ✅ **Xabar holati** - Yuborildi, yetkazildi, o'qildi ko'rsatkichlari
- 📱 **Responsive dizayn** - Barcha qurilmalarda ishlaydi
- 🌙 **Qorong'u tema** - Telegram Web ranglariga o'xshash dizayn

## 🛠️ Texnologiyalar

### Backend
- **Node.js + TypeScript** - Server-side dasturlash
- **Express.js** - Web framework
- **Socket.io** - Real-time aloqa
- **MongoDB + Mongoose** - Ma'lumotlar bazasi
- **JWT** - Autentifikatsiya
- **Multer** - Fayl yuklash
- **bcrypt** - Parol shifrlash

### Frontend
- **React + TypeScript** - Foydalanuvchi interfeysi
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Socket.io-client** - Real-time client
- **Axios** - HTTP client

## 🚀 O'rnatish va ishga tushirish

### Talablar
- Node.js (v18 yoki yuqori)
- MongoDB (v6 yoki yuqori)
- npm yoki yarn

### 1. Loyihani klonlash
```bash
git clone https://github.com/xudoyorkholov-bit/telegram-clone.git
cd telegram-clone
```

### 2. Bog'liqliklarni o'rnatish
```bash
# Barcha bog'liqliklarni o'rnatish
npm run install:all

# Yoki alohida o'rnatish
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. MongoDB ishga tushirish
```bash
# Windows uchun
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"

# Linux/Mac uchun
mongod
```

### 4. Environment o'zgaruvchilarini sozlash

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/telegram-clone
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

**Frontend (src/.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 5. Loyihani ishga tushirish
```bash
# Development rejimida (frontend va backend birga)
npm run dev

# Yoki alohida ishga tushirish
npm run dev:backend  # Backend (port 5000)
npm run dev:frontend # Frontend (port 3000)
```

### 6. Brauzerda ochish
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📁 Loyiha tuzilishi

```
telegram-clone/
├── backend/                 # Backend server
│   ├── src/
│   │   ├── config/         # Database va boshqa sozlamalar
│   │   ├── models/         # MongoDB modellari
│   │   ├── routes/         # API yo'nalishlari
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Middleware funksiyalar
│   │   ├── socket/         # Socket.io handlers
│   │   └── utils/          # Yordamchi funksiyalar
│   ├── uploads/            # Yuklangan fayllar
│   └── package.json
├── frontend/               # Frontend React app
│   ├── src/
│   │   ├── api/           # API client funksiyalar
│   │   ├── components/    # React komponentlar
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Sahifa komponentlari
│   │   ├── store/         # State management
│   │   └── main.tsx       # Entry point
│   └── package.json
├── .kiro/specs/           # Loyiha spetsifikatsiyasi
└── package.json           # Root package.json
```

## 🔧 API Endpoints

### Autentifikatsiya
- `POST /api/auth/login-phone` - Telefon raqami bilan kirish
- `POST /api/auth/refresh` - Token yangilash

### Foydalanuvchi
- `GET /api/users/me` - Joriy foydalanuvchi ma'lumotlari
- `PUT /api/users/me` - Profil yangilash
- `GET /api/users/search` - Foydalanuvchilarni qidirish

### Xabarlar
- `GET /api/messages/:chatId` - Chat xabarlarini olish
- `POST /api/messages` - Yangi xabar yuborish

### Chatlar
- `GET /api/chats` - Foydalanuvchi chatlari
- `POST /api/chats` - Yangi chat yaratish

### Media
- `POST /api/media/upload` - Fayl yuklash
- `GET /api/media/:id` - Faylni olish

## 🎯 Keyingi rejalar

- [ ] **Guruh chatlari** - Ko'p foydalanuvchili chatlar
- [ ] **Sozlamalar** - Maxfiylik va bildirishnoma sozlamalari
- [ ] **Hujjat yuborish** - PDF, DOC, ZIP fayllar
- [ ] **Bildirishnomalar** - Browser notifications
- [ ] **Xabar tahrirlash** - Yuborilgan xabarlarni o'zgartirish
- [ ] **Xabar o'chirish** - O'zi uchun yoki hamma uchun
- [ ] **Typing indicators** - Yozayotganini ko'rsatish
- [ ] **Message search** - Xabarlarni qidirish

## 🤝 Hissa qo'shish

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. O'zgarishlarni commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Branch ga push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📝 Litsenziya

Bu loyiha MIT litsenziyasi ostida tarqatiladi. Batafsil ma'lumot uchun `LICENSE` faylini ko'ring.

## 👨‍💻 Muallif

**Xudoyorkhon Kholov**
- GitHub: [@xudoyorkholov-bit](https://github.com/xudoyorkholov-bit)
- Email: xudoyorkholov.bit@gmail.com

## 🙏 Minnatdorchilik

- [Telegram Web](https://web.telegram.org) - Dizayn ilhomi
- [Socket.io](https://socket.io) - Real-time aloqa
- [MongoDB](https://mongodb.com) - Ma'lumotlar bazasi
- [React](https://reactjs.org) - Frontend framework