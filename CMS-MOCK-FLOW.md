# Kiểm tra mock CMS → Banner → Client

Chỉ dùng cho demo local ở chế độ MOCK. Không cần API Java hoặc database để test phần này.

## Luồng kiểm tra

1. Trong admin, vào Nội dung & hiển thị → Trang nội dung → Tạo trang mới.
2. Nhập thông tin trang và SEO, lưu/tiếp tục. Muốn dùng làm trang chủ thì đặt slug là `trang-chu`.
3. Thêm block Banner. Có thể chọn vị trí đã tạo ở menu Banner hoặc bấm Tạo nội dung banner ngay trong block.
4. Builder dùng component của trading-admin:
   - Lưới: lưới 4 × 2; có thể gộp ô như source.
   - Trượt ngang: thêm/xóa/sắp xếp các slide.
   - Hai khung: cấu hình hai banner.
5. Upload nội dung desktop và điện thoại cho từng ô/slide. Cấu hình chữ, vị trí chữ/nút, màu và đường dẫn bằng form gốc.
6. Bấm Lưu và áp dụng mã vị trí. Mã được gắn vào block, không cần tự nhập ID hoặc URL ảnh.
7. Thêm các block còn lại, điền các trường bắt buộc. Kéo thả để đổi thứ tự.
8. Xuất bản trang. Mở client theo đường dẫn của trang và tải lại để xem nội dung mới. Trang nháp không được hiển thị.
9. Muốn sửa banner: mở lại block hoặc menu Banner; builder tải lại nội dung đã lưu. Xóa vị trí ở menu Banner sẽ làm banner đó không còn xuất hiện trên client.

## Dữ liệu và phạm vi

- Trang/block: `jewelry-commerce-client/.demo-data/cms-pages.json`.
- Vị trí/nội dung banner: `jewelry-commerce-client/.demo-data/cms-banners.json`.
- File upload: `jewelry-commerce-client/.demo-data/cms-media/`.
- Admin và client đọc cùng kho mock; không có bộ banner mẫu tự tạo.
- Không có bước tạo layout CMS. Cấu hình các ô banner là cấu trúc của dịch vụ banner, không phải layout trang.
- Các endpoint `/api/demo-cms/*` chỉ bật ở development/local.
- Component nguồn nằm ở `src/trading-ui/pages/content-display/cms/components/`. Utility được tách riêng để dùng với Fast Refresh; markup/style của builder nguồn được giữ lại.

Các test dùng dữ liệu riêng trong bộ nhớ; không tạo/xóa trang hoặc banner của người dùng. Không chạy server hoặc commit/push trong lúc triển khai.
