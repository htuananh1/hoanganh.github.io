# Deploy lên Vercel - Hướng dẫn

## ✅ Đã sửa để deploy lên Vercel

Game đã được cập nhật để chạy hoàn toàn trên Vercel mà không cần backend riêng:

### Thay đổi chính:

1. **API Routes trong Next.js**: Tất cả API endpoints đã được chuyển sang Next.js API routes
2. **In-memory Storage**: Sử dụng in-memory storage (có thể thay bằng database sau)
3. **Không cần NEXT_PUBLIC_API_URL**: Sử dụng relative URLs

## 🚀 Deploy

### Bước 1: Push code lên GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### Bước 2: Deploy trên Vercel

1. Vào https://vercel.com
2. Click "New Project"
3. Import repository: `htuananh1/hoanganh.github.io`
4. **KHÔNG CẦN** thêm Environment Variables
5. Click "Deploy"

### Bước 3: Hoàn tất

Vercel sẽ tự động:
- Build Next.js app
- Deploy API routes
- Tạo production URL

## 📝 Lưu ý

### In-memory Storage
- Dữ liệu sẽ mất khi server restart
- Để lưu trữ lâu dài, nên dùng:
  - Vercel Postgres
  - MongoDB Atlas
  - Supabase
  - Firebase

### Session Management
- Hiện tại dùng cookies
- Có thể cải thiện với JWT tokens

## 🔧 Cải thiện sau (Optional)

1. **Database**: Thay in-memory bằng Vercel Postgres
2. **Authentication**: Thêm JWT tokens
3. **Real-time**: Thêm WebSocket cho multiplayer
4. **Persistence**: Lưu game state vào database

## ✅ Đã sẵn sàng deploy!

Game có thể deploy trực tiếp lên Vercel mà không cần cấu hình thêm.
