# Run và trạng thái tích hợp Java

> Cập nhật 11/10/2026: xem [JAVA-FULL-FLOW-REPORT.md](./JAVA-FULL-FLOW-REPORT.md) để biết trạng thái mới nhất, UI đã chuyển, các blocker theo luồng và feedback cho agent partner. Các số test/nhận định runtime trong phần cũ bên dưới là lịch sử, không phải kết quả mới nhất. Admin hiện build thành công, 61 tests pass; client 613 tests và TypeScript check pass. Chưa xác nhận full E2E Java. Không commit/push.
## Cập nhật UI từ trading-admin — 11/10/2026

Mục này cập nhật trạng thái mới hơn các kết quả kiểm tra ghi bên dưới.

- Đã chuyển page/component gốc cho sản phẩm, danh mục, bộ sưu tập, thuộc tính, label và cấu hình label; đơn hàng, khuyến mãi, yêu cầu khách hàng. Giữ cấu trúc form/list/dialog thay vì các màn hình giản lược trước đó.
- Sidebar dùng cấu trúc gốc: Đơn hàng ở trên; Danh mục sản phẩm chứa Danh mục/Bộ sưu tập; import/export nằm trong danh sách, không có menu Chất liệu/Đá quý riêng.
- CMS dùng component wizard/list gốc; mở trang hiện có thì các bước được đánh dấu hoàn tất màu xanh; save/publish thành công điều hướng về danh sách. List dùng các action gốc. Xóa trang chưa thực hiện được vì thiếu DELETE bên Java.
- Đã kiểm tra chỉ đọc qua trình duyệt: CMS edit, danh mục, bộ sưu tập, thuộc tính, tạo label, tạo cấu hình label, danh sách đơn/khuyến mãi và hỗ trợ đơn hàng; không có runtime exception ở các trang này. Không tạo/xóa dữ liệu người dùng để kiểm thử.
- Adapter Java chuẩn hóa ID số sang chuỗi tại UI boundary; request theo DTO Java. Test mới kiểm tra CMS PUT không tạo bản ghi trùng, publish thành công về list/lỗi thì giữ trang, và ID/code/trạng thái/count của đơn hàng.
- Kiểm tra mới nhất: build admin thành công; 48 tests / 20 files thành công; typecheck không có lỗi. Lint còn 241 warnings từ component gốc, chưa xử lý hết.
- Không mang nút seed bộ sưu tập công ty sang bản đồ án. Không thêm dữ liệu mẫu.

### Chưa hoàn tất — cần xử lý trước khi xác nhận full flow

1. **Tạo/sửa sản phẩm đang có blocker:** form gốc yêu cầu SEO, còn DTO/persistence Java chưa lưu SEO. Adapter chặn trước khi ghi để không mất dữ liệu. Cần Java lưu đầy đủ metaTitle/metaDescription/metaKeywords; đồng thời đối chiếu thuế, productInfos, mix-match, giá vốn/B2B và kích thước SKU. Không coi form render được là tạo sản phẩm thành công.
2. **Khuyến mãi:** list gốc đã nối dữ liệu Java cơ bản; wizard campaign/draft/schema của bản gốc chưa có contract tương đương trong Java. Không dùng CRUD đơn giản để tuyên bố wizard đầy đủ đã tích hợp.
3. **Đơn hàng:** list/detail và hủy/giao có adapter Java; tạo/sửa/clone, ghi chú, stock-check và các nghiệp vụ nâng cao của page gốc chưa nối đủ. Java chỉ có các trạng thái cơ bản, không có toàn bộ status tab của UI gốc.
4. **CMS/label/banner:** thiếu DELETE page/placement/flow; grid/double banner chưa lưu đủ cấu trúc layout. Trang banner độc lập hiện vẫn là list kết hợp builder gốc, chưa phải toàn bộ page gốc. Header/footer, set, review và cấu hình hiển thị chưa có đầy đủ API Java.
5. **Filter:** advanced filter/sort và một số filter theo thời gian chưa map hết. Không dùng kết quả list hiện tại làm bằng chứng các filter đều hoạt động.
6. API công ty chưa map sang Java bị chặn với lỗi JAVA_CAPABILITY_NOT_SUPPORTED, không gửi nhầm endpoint. Một số page gốc còn xử lý lỗi SWR bằng empty state; cần hoàn thiện hiển thị lỗi trước khi gọi là hoàn tất behavior.

Chỉ sửa FE/adapters trong lượt UI này; chưa sửa Java hoặc DB, chưa commit/push. Không khẳng định đã giống 100% hoặc kiểm thử end-to-end toàn bộ.


Ngày: 11/10/2026. Java được đối chiếu ở commit `f462096` (`v4`).
Java là backend chính; Nest chỉ là backup. Không sửa source Java, không commit/push, không khởi chạy server hay sửa DB trong phiên tích hợp này.

## 1. Những phần FE đã nối

Đây là trạng thái implementation và kiểm thử FE, **chưa phải xác nhận end-to-end với DB Java thật**.

| Luồng | Phần đã nối |
| --- | --- |
| Đăng nhập | Admin nhập SĐT, kiểm tra role ADMIN; client dùng cookie HttpOnly qua Next BFF. Admin adapter fetch có refresh token khi nhận 401. |
| Đăng ký client | Nhập SĐT → gửi OTP Java → verify lấy registrationToken → hoàn tất hồ sơ → tạo cookie đăng nhập. OTP demo do Java quyết định, không dùng account mock. |
| PIM | Danh mục cha/con; thuộc tính chữ/options; tạo/sửa product/SKU; binding thuộc tính SKU; ảnh; draft/publish/unpublish/archive. |
| Collection | Tạo/sửa metadata và thêm/bỏ membership sản phẩm. ACTIVE/INACTIVE của UI được chuyển thành PUBLISHED/DRAFT của Java. |
| Tồn kho | Đọc SKU thật, nhập/điều chỉnh số lượng bằng skuId. Java hiện chỉ có một kho MAIN. |
| CMS | Tạo/sửa page, chọn/sắp xếp/bật tắt block, publish; client lấy nội dung theo slug. Chỉ dùng các loại block Java hiện hỗ trợ. |
| Banner | Tạo placement/banner, upload desktop/mobile, đổi nội dung, gắn banner bằng placementCode/sortOrder; builder gốc dùng cho slider. Không giả lập bảng layout. |
| Nhãn | CRUD template; tạo/sửa/kích hoạt/ngừng cấu hình; một nhãn; phạm vi all/category/collection/SKU/promotion, hết hàng tự động; client lấy badge theo skuIds. |
| Sản phẩm client | Detail/variant selector; SKU card; chuyển query category/collection; carousel thủ công chỉ lấy đúng ID được chọn, bỏ sản phẩm không còn public. |
| Yêu thích | Chuyển endpoint về storefront/product/customer/wishlist. Wire DTO Java được đối chiếu với FE; chưa test runtime. |
| Giỏ hàng | Guest ID, thêm hàng, PUT số lượng tuyệt đối, clear/merge. Không gửi set/packaging vào Java khi chưa hỗ trợ. |
| Checkout | Draft thao tác lưu ở sessionStorage; giá/tồn/voucher/đơn đều do Java kiểm tra. Guest quote/order hoặc order tài khoản dùng addressId. COD; nhập/bỏ một voucher bằng quote. |
| Đơn hàng | Client danh sách/chi tiết/hủy; guest tra cứu mã + SĐT. Admin đọc đơn thật và chuyển PENDING → CONFIRMED → SHIPPING → DELIVERED hoặc CANCELLED theo Java. |
| Yêu cầu khách hàng | Client gửi back-in-stock/order-support/newsletter; admin danh sách theo loại, chọn hàng và cập nhật trạng thái hàng loạt. |
| Khuyến mãi | Admin CRUD PERCENT/FIXED/FLAT_PRICE với picker sản phẩm có sẵn; voucher PERCENT/FIXED; draft/published và thời gian áp dụng. |

ID của entity Java là số. UI dùng chuỗi ID để tương thích component; payload được chuyển theo DTO Java (ví dụ skuId/productIds numeric, badgeTemplateId và customer-request ids vẫn là chuỗi số theo DTO). UUID của checkout draft chỉ là khóa phiên FE, **không phải ID entity gửi xuống DB**.

Form/component PIM, CMS, banner, thiết kế nhãn, phạm vi nhãn, picker sản phẩm được tái sử dụng từ các component đã có trong admin. Màn hình đơn/tồn/yêu cầu/khuyến mãi dùng bộ bảng, input, nút của admin với contract Java đơn giản. **Không khẳng định tất cả màn hình/behavior đã giống 100% source tham chiếu.**

## 2. Còn thiếu — không xem là hoàn tất toàn bộ đồ án

### Java chưa đủ để giữ toàn bộ behavior/field FE

- Banner GRID/DOUBLE_BANNER: thiếu persistence slot/tọa độ/span/layout; response hiện gom banner vào slot main. Slider đã nối; các lựa chọn layout chưa lưu được bị khóa. Không tự thêm schema BE.
- Banner placement chưa có DELETE; badge-flow chưa có DELETE/detail endpoint riêng (FE đọc detail từ list, update bằng PUT đầy đủ).
- PIM chưa lưu đủ thuế/giá vốn/B2B/kích thước/SEO/product infos/mix-match; category chưa có binding/inheritance thuộc tính như form đầy đủ. Adapter báo rõ nếu gửi dữ liệu không được lưu.
- Category/attribute/collection chưa có API xóa đầy đủ. Dynamic filter theo thuộc tính SKU chưa có API public tương ứng.
- Không có location lookup / quote hãng vận chuyển. Địa chỉ nhập tên tỉnh/phường, không tạo mã địa lý giả; phí vận chuyển lấy quote Java.
- Checkout chưa có server session/idempotency key. FE khóa double click cùng draft và chặn đặt lại nếu mất kết nối sau submit, nhưng không thay thế được idempotency server/cross-tab.
- Client return/exchange/refund workflow, review, set, header/footer/navigation, đổi SĐT/mật khẩu và các tính năng phụ như recently-viewed/trending chưa có đủ API tương ứng.

### Phần FE còn chưa nối toàn bộ

- Admin customer detail/access/roles, full pre-order và các màn hình advanced của order/return/refund chưa hoàn tất tích hợp UI.
- Advanced filter/sort/discovery voucher, báo cáo/dashboard và một số route placeholder chưa tích hợp. Trong HTTP, bảng placeholder không hiển thị mock để che thiếu API.
- Read-only UI/khóa nút cho tất cả field không được Java hỗ trợ chưa đồng nhất toàn bộ PIM. Có trường đang được chặn tại adapter trước khi ghi.
- Chưa kiểm tra upload, publish, render, mua hàng trên trình duyệt với backend/DB đang chạy.

## 3. Kết quả kiểm tra

- Admin: `npm run build` thành công; 42 tests thành công.
- Client: `npm run build` thành công; 613 tests thành công.
- TypeScript/lint không có lỗi blocking; còn warnings ở component cũ, vendor chunks và metadata động khi build.
- Các test Java mới dùng stub HTTP responses để kiểm tra wire contract/behavior FE. **Không phải test server Java hay DB transaction.**
- Phiên này không có `java`/`mvn` trong PATH, chưa compile/test Java, chưa chạy browser end-to-end.
- Không chạy dev server theo yêu cầu. Java source và DB không bị sửa.

## 4. Run local — ba terminal

### Backend Java

Yêu cầu JDK 17+, Maven, PostgreSQL **riêng của đồ án**. Không dùng kết nối/DB công ty.
Nếu dùng DB đã có, xác nhận schema đã cập nhật tới migration V15 và tài khoản Java với partner.

Trong terminal PowerShell của `kltn_ecommerce/pk-core`, đặt cấu hình DB riêng trước khi run:
```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5433/kltn_ecommerce"
$env:DB_USERNAME = "<user PostgreSQL riêng>"
$env:DB_PASSWORD = "<mật khẩu PostgreSQL riêng>"
$env:PORT = "8082"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:6100,http://localhost:3100"
$env:UPLOAD_DIR = "<đường dẫn thư mục upload riêng>"
$env:UPLOAD_PUBLIC_BASE_URL = "http://localhost:8082"
mvn clean install
mvn -f pk-service/pom.xml spring-boot:run "-Dspring-boot.run.profiles=dev"
```

5433 là ví dụ cho PostgreSQL Docker riêng; thay đúng port/DB thực tế. Các lệnh trên là hướng dẫn, chưa được chạy trong phiên này.

**Lưu ý migration:** profile dev hiện tắt Flyway. Với DB mới hoàn toàn trống, có thể bật `SPRING_FLYWAY_ENABLED=true` để chạy migrations. Không bật bừa trên DB cũ đã import SQL nhưng chưa có flyway_schema_history; yêu cầu partner hướng dẫn baseline/migrate, không xóa DB để xử lý.
README Java hướng dẫn chạy SQL thủ công; không chạy cả SQL và Flyway trên cùng DB mới mà chưa kiểm tra.

Swagger: http://localhost:8082/swagger-ui.html. Account mock `0796406514/123456` không được mặc định dùng cho Java; dùng tài khoản có thật. Admin cần role ADMIN.
Đăng ký OTP dev lấy mã theo cấu hình/log Java. Có thể đặt `OTP_FIXED_CODE` chỉ ở môi trường demo riêng; không dùng production.

### Admin

Trong `jewelry-commerce-admin`:
```powershell
npm ci
npm run dev
```

Mở http://localhost:6100. File `.env.local` trên máy hiện tại đã chuyển provider JAVA và URL 8082. Máy khác merge các khóa từ `.env.java.example`, không ghi đè bí mật/cấu hình khác.

### Client

Trong `jewelry-commerce-client`:
```powershell
npm ci
npm run dev
```

Mở http://localhost:3100. Merge `.env.java.example` vào `.env.local` khi đổi máy. Cả API_BE_URL và NEXT_PUBLIC_CONTENT_API_URL đều trỏ Java 8082, prefix /api/v1.
Phải restart dev server sau đổi env. Không cần build để test local.

## 5. Checklist test thủ công

1. Đăng nhập admin bằng tài khoản Java.
2. Tạo danh mục; tạo thuộc tính chữ và options; tạo product/SKU/ảnh; lưu nháp.
3. Mở sửa, kiểm tra dữ liệu/ảnh/options còn đúng. Nhập tồn ở Kho vận; publish product.
4. Tạo collection, chọn product, bật hiển thị; kiểm tra lại membership khi mở sửa.
5. Tạo banner slider và ảnh desktop/mobile; mở lại để kiểm tra thứ tự/nội dung.
6. Tạo page slug `trang-chu`, thêm banner bằng picker placement, product carousel bằng picker, info card/gallery; publish.
7. Client tải lại: đúng block, thứ tự, ảnh, chỉ sản phẩm public thuộc phạm vi đã chọn.
8. Tạo mẫu nhãn ACTIVE; tạo cấu hình một nhãn áp dụng SKU/category/collection; mở sửa giữ phạm vi; kiểm tra client.
9. Tạo voucher PUBLISHED trong thời gian hợp lệ. Client thêm giỏ, chọn qty, nhập địa chỉ, nhập voucher, so tổng tiền.
10. Đặt COD guest: thành công, tra cứu mã + SĐT. Sau đó đăng nhập Java, đặt COD và kiểm tra lịch sử/chi tiết.
11. Admin tải lại đơn, xác nhận/giao/giao thành công. Hủy một đơn khác trước giao; kiểm tra tồn giữ chỗ được trả đúng.
12. Gửi yêu cầu báo có hàng/hỗ trợ/nhận tin ở client; admin đọc và cập nhật trạng thái.
13. Tắt page/unpublish product và reload client: không tự hiện nội dung mock, không mua được SKU đã bị ngừng.

Nếu bất kỳ bước nào lỗi, ghi request URL, HTTP status, request/response không chứa token/password, mã entity, bước tái hiện. Không dùng mock để chứng minh runtime Java.

## 6. Feedback cho agent partner

Đọc đủ bốn source: `jewelry-docs`, `jewelry-commerce-client`, `jewelry-commerce-admin`, `kltn_ecommerce`. Không cần source công ty.

Ưu tiên:
1. Chạy Maven tests và checklist tạo dữ liệu mới → publish → CMS/badge → cart → COD → xử lý/hủy đơn với DB riêng, không chỉ kiểm tra Swagger.
2. Chốt/hướng dẫn schema migration hiện tại (dev đang tắt Flyway), account admin/customer và upload public URL.
3. Bổ sung backend idempotency đặt hàng; kiểm thử hủy đồng thời/stock release/adjustment, quyền sở hữu địa chỉ/đơn và pricing voucher.
4. Nếu cần giữ đủ UI banner, bổ sung persistence grid/double slots và CRUD placement; thống nhất endpoint/schema với FE, không gộp CMS page-layout vào nghiệp vụ này.
5. Bổ sung field/API còn thiếu trong mục 2 theo scope đã chốt. Trường nào chưa làm phải nói rõ, không nhận rồi bỏ qua nhưng báo thành công.

Các interface adapter Java của FE nằm ở `src/apis/java` (admin) và `src/utils/api/java` (client). Không đổi về UUID. Gửi lại exact request/response và tests cho endpoint bổ sung; FE giữ riêng adapter để Nest backup không ảnh hưởng.
