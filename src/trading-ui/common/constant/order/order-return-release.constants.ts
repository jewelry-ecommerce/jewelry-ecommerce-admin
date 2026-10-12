// File này dùng để giữ form đổi trả trên hợp đồng OMS đã có ở Production.
// Kiến thức: Admin v1.0.30 chứa RETAIL-1813 nhưng OMS v1.0.34 chưa có /admin/order-returns/quote và /commit.
// Khái niệm: cờ release là một công tắc trong source; thay đổi nó phải build lại FE, không tự đổi lúc ứng dụng đang chạy.
// Giữ code mới để release sau; chỉ bật lại khi cả OMS và quyền API của luồng mới đã được kiểm chứng trên môi trường đích.
export const ADMIN_ORDER_RETURN_EXCHANGE_V2_ENABLED: boolean = false;
