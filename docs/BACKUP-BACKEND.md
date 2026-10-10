
# Backend backup NestJS

Component CMS/banner giữ nguyên; chỉ transport thay đổi khi VITE_DATA_SOURCE=HTTP.

Cấu hình trong .env.local (không commit):
VITE_DATA_SOURCE=HTTP
VITE_API_BASE_URL=http://localhost:8083
VITE_API_PREFIX=/api/v1

Backend: jewelry-commerce-be. Tạo tài khoản operator qua PROVISION_ADMIN_* rồi chạy npm run admin:provision.
Không dùng tài khoản mock để đăng nhập backend.

Đã nối CMS pages, banner command và upload. PIM/badge/header-footer vẫn chưa nối đầy đủ.
Không bật HTTP cho buổi demo toàn bộ cho đến khi phần còn lại được tích hợp và kiểm thử.
ID số của backend chuyển thành string key ở UI; gửi lại ID số khi lưu CMS.
JWT qua Authorization, không phụ thuộc cookie cross-origin.

Mock cũ và dữ liệu người dùng giữ nguyên. Không khởi động server hoặc commit/push tự động.
