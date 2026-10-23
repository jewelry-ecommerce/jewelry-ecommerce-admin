# Deploy Admin lên Vercel

- Giữ branch làm việc `develop`; kiểm tra Production Branch trong dashboard, không tự đổi.
- Node.js 24.x. `vercel.json` đã có build và SPA fallback để refresh route không 404.
- Điền `.env.cloud.example` bằng URL Java Render thật (không phải localhost), rồi redeploy.
- Không đưa DB password, JWT private key, Cloudinary secret vào Vercel Admin.
- CI tại `.github/workflows/ci.yml`: npm ci → check → test → build. CI không tự push/deploy hay chỉnh dashboard.
- Git auto-deploy Vercel cần được chủ dự án kết nối; GitHub CI không mặc nhiên chặn Vercel khi fail.
- Backend CORS phải cho phép đúng origin HTTPS của Admin.
- Hướng dẫn toàn bộ: repo Java `deploy/DEPLOY-FREE.md`.
