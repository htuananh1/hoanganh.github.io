# Game Đánh Bài Xâm Online - Vercel Deployment

Giao diện đẹp mắt cho game đánh bài xâm, sẵn sàng deploy lên Vercel.

## ✨ Tính năng

- 🎨 **Giao diện hiện đại** với Tailwind CSS và Framer Motion
- 📱 **Responsive design** - Hoạt động trên mọi thiết bị
- ⚡ **Fast & Optimized** - Next.js 14 với App Router
- 🎭 **Animations mượt mà** - Framer Motion animations
- 🌈 **Beautiful UI** - Gradient backgrounds, glassmorphism effects
- 🔔 **Toast notifications** - React Hot Toast
- 🎴 **Card animations** - Flip và reveal animations

## 🚀 Deploy lên Vercel

### Cách 1: Deploy trực tiếp từ GitHub

1. **Push code lên GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/card-game-xam-vercel.git
git push -u origin main
```

2. **Deploy trên Vercel:**
   - Vào [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import repository từ GitHub
   - Thêm Environment Variable:
     - `NEXT_PUBLIC_API_URL`: URL của backend API
   - Click "Deploy"

### Cách 2: Deploy bằng Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

## 🛠️ Development

### Cài đặt dependencies

```bash
npm install
```

### Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

### Build production

```bash
npm run build
npm start
```

## ⚙️ Cấu hình

### Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Hoặc trên Vercel, thêm vào Project Settings > Environment Variables.

### Backend API

Frontend này cần một backend API. Bạn có thể:

1. **Sử dụng backend Flask** từ project `card-game-xam`
2. **Deploy backend lên Vercel** (tạo API routes)
3. **Sử dụng backend khác** - chỉ cần đảm bảo API endpoints tương thích

## 📁 Cấu trúc Project

```
card-game-xam-vercel/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── GameBoard.tsx       # Game board component
│   ├── GameList.tsx        # Game list component
│   └── StatsCard.tsx       # Stats card component
├── lib/
│   └── api.ts              # API client
├── public/                 # Static files
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind config
└── package.json
```

## 🎨 UI Components

### GameBoard
- Hiển thị bàn chơi với cards
- Actions: Hit, Stand, Double
- Real-time game state updates

### GameList
- Danh sách phòng chơi
- Tạo phòng mới
- Join game

### StatsCard
- Thống kê người chơi
- Win rate, games played, chips

## 🔧 Customization

### Colors

Chỉnh sửa `tailwind.config.js`:

```js
colors: {
  primary: {
    // Your colors
  }
}
```

### Animations

Sử dụng Framer Motion trong components:

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  whileHover={{ scale: 1.05 }}
>
  Content
</motion.div>
```

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🐛 Troubleshooting

### API Connection Error

- Kiểm tra `NEXT_PUBLIC_API_URL` đúng chưa
- Đảm bảo backend đang chạy
- Kiểm tra CORS settings trên backend

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Vercel Deployment Issues

- Kiểm tra Environment Variables
- Xem logs trên Vercel Dashboard
- Đảm bảo build command thành công

## 📄 License

Free to use and modify!

## 🙏 Credits

- Next.js 14
- Tailwind CSS
- Framer Motion
- Lucide Icons
- React Hot Toast
