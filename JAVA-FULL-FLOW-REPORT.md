# Report tích hợp Java — toàn luồng admin/client

Ngày: 11/10/2026. Backend đã rà: kltn_ecommerce commit f462096 (v4).

## 1. Kết luận

**Chưa thể xem là hoàn tất toàn bộ luồng.** UI và API cơ bản đã nối, nhưng Java chưa đủ persistence/endpoint cho toàn bộ form và behavior hiện có. Render được trang không có nghĩa tạo/sửa/publish được đầy đủ.

Điểm chặn lớn nhất: form sản phẩm gốc bắt buộc SEO nhưng AdminCreateProductRequestDto/AdminUpdateProductRequestDto chưa có SEO. FE đang chặn lưu thay vì bỏ SEO rồi báo thành công. Vì vậy chưa thể xác nhận luồng tạo sản phẩm đầy đủ → publish → CMS → client → mua hàng đã chạy trọn vẹn.

Report này thay phần đánh giá trạng thái cũ trong JAVA-INTEGRATION.md. Không sửa Java, không thêm dữ liệu mẫu, không xóa dữ liệu người dùng trong lượt này.

## 2. Agent backend phải đọc những gì

Chỉ cần 4 source: jewelry-docs, jewelry-commerce-admin, jewelry-commerce-client, kltn_ecommerce. **Không yêu cầu source dự án công ty.**

- Đọc AGENTS.md/README và hướng dẫn riêng từng repo trước khi sửa.
- Admin: src/router/route.constant.ts, src/router/dashboard-sidebar.nav.ts, src/trading-ui/pages, src/trading-ui/apis, src/apis/java.
- Client: src/utils/api/java, src/utils/api/content-backend, src/utils/api/cart, src/utils/config/java-backend.config.ts; lần theo component gọi các API này.
- Java: pk-core/pk-api/.../rest/admin, pk-core/pk-model/.../dto/request và response, service/entity/repository/migrations tương ứng.
- jewelry-docs là tài liệu scope; source FE hiện tại là căn cứ cụ thể về field/behavior. Có khác nhau phải nêu rõ, không tự bỏ field.

Folder src/trading-ui trong admin đã chứa component/interface cần tham khảo. Tên folder không có nghĩa cần truy cập một repo khác.

## 3. Phần FE đã làm

- Sidebar có 5 nhóm chính: Đơn hàng, Sản phẩm, Khuyến mãi, Yêu cầu khách hàng, Nội dung & hiển thị.
- Danh mục sản phẩm gộp danh mục/bộ sưu tập. Không đặt chất liệu/đá quý/import/export thành mục sidebar riêng.
- Dùng lại các page/component gốc cho danh sách, form, picker, dialog, wizard, bảng, thao tác, theme; không thay bằng form CRUD tối giản.
- CMS dùng wizard thông tin → khối nội dung → xuất bản. Sửa trang có dữ liệu đánh dấu bước hoàn tất; xuất bản thành công quay về danh sách. Có action xem/sửa/xóa, nhưng xóa còn bị chặn vì Java chưa có endpoint.
- Các màn hình vận chuyển, đổi/trả, hoàn tiền, hóa đơn đã chuyển vào router bằng component gốc, không còn placeholder ở 4 route này.
- Adapter chuẩn hóa ID số Java thành chuỗi ở UI; không yêu cầu UUID.
- Detail đơn hàng có action Java theo trạng thái: PENDING → CONFIRMED → SHIPPING → DELIVERED; hủy gọi endpoint Java hiện có.
- Picker sản phẩm/SKU trong tạo đơn đã đọc catalog Java; giá, ảnh, tồn lấy từ response, không bịa số liệu.
- Các API gốc chưa có mapping Java bị chặn và hiện cảnh báo trên trang, không gọi server công ty hoặc fallback mock.
- Filter chưa hỗ trợ bị báo rõ, không âm thầm bỏ điều kiện. Các filter cơ bản đã có mapping hoặc lọc trên dữ liệu thật đã tải đủ.
- Đã sửa query ngày admin orders sang yyyy-MM-dd đúng parser Java; sort mặc định updatedAt của PIM được xử lý trên toàn bộ tập dữ liệu thật trước khi phân trang, không sort riêng từng page.
- Review mẫu/counters mẫu của component gốc không được hiển thị ở provider Java; hiện cảnh báo chưa tích hợp moderation, không giả thành dữ liệu thực.

**Không tuyên bố UI/behavior đạt 100%:** chưa kiểm tra thao tác đầy đủ trên tất cả form; nhiều action vẫn bị contract Java chặn. Những page dư từ scope gốc không tự biến thành nghiệp vụ đã hoàn thành.

## 4. Bảng trạng thái thực tế

Các endpoint bên dưới được hiểu có prefix cấu hình /api/v1; đường dẫn UI không phải đường dẫn API.

| Luồng | API Java đã có / FE đã nối | Còn chặn |
|---|---|---|
| Đăng nhập admin/client | Auth Java, tài khoản/phiên thật | Cần test refresh/expiry/role và phân quyền thực tế |
| Danh mục | CRUD cơ bản ở admin/catalog/categories; cây cha/con | Code/status/thuế/SEO/thuộc tính theo danh mục chưa đủ để lưu full form |
| Bộ sưu tập | Tạo/sửa/list, thêm/xóa thành viên bằng API Java | Chưa có xóa collection; cần đảm bảo thứ tự thành viên và timestamps đúng contract |
| Thuộc tính | Tạo/sửa/list options chữ; gán giá trị vào SKU | Java options là string[], chưa giữ ID/code/image/displayType/status/isVariantAxis đầy đủ |
| Sản phẩm/SKU | List/detail, product/SKU CRUD cơ bản, ảnh, bindings, publish/unpublish/archive/delete | Full form tạo/sửa bị chặn bởi field thiếu, nhất là SEO |
| Upload | Adapter upload Java dùng picker gốc | Cần test file mới → URL public → reload admin/client; không phải chỉ nhận được URL |
| Bộ sản phẩm/đánh giá | UI list/detail từ source gốc | Chưa có adapter Java tương ứng; không được xem empty state là DB không có dữ liệu |
| CMS page/block | List/detail/create/update, lưu blocks/config, publish qua update page, client render | Xóa page chưa có; cần test từng block và nguồn carousel; chưa chứng minh đủ bằng E2E |
| Banner | CRUD nội dung, placements create/update/list, slider binding + sortOrder | GRID/DOUBLE layout/slot/scheduling/platform chưa đủ; chưa có delete placement |
| Label | Template CRUD/status, flow list/create/update/status và client badge | Chưa chứng minh tất cả rule/design/priority/channel qua runtime; flow search chưa hỗ trợ trong adapter |
| Header/footer | Top banner/logo/navigation/footer UI gốc | Chưa có API Java tương ứng cho settings này; client chưa thể nhận cấu hình mới |
| Promotion/voucher | Java có giảm giá/voucher cơ bản; overview/delete đã nối | Chưa đủ draft/schema/target/benefit/condition/audience/publish/detail cho wizard gốc |
| Customer request | 3 loại list/detail/status/bulk-status và client gửi yêu cầu | Cần test end-to-end từng loại; không tự thêm workflow replies khi scope/source không cần |
| Giỏ hàng/checkout COD | Adapter Java cart/quote/guest và authenticated checkout; payment online ẩn | Cần E2E sản phẩm thật; server idempotency/stock/price/owner checks phải kiểm thử |
| Lịch sử/chi tiết đơn | Java account orders/detail, guest tra cứu code + phone | Cần test quyền sở hữu, tài khoản khác/guest không truy cập được dữ liệu riêng |
| Admin đơn hàng | List/detail, filter cơ bản, confirm/ship/deliver/cancel | Tạo/sửa/clone đơn thủ công chưa có mapping; shipping/invoice/full return-exchange/refund-proposal thiếu contract |

Java **có** POST admin/orders/{orderCode}/return và /refund cơ bản. Không được báo rằng hoàn toàn không có API trả/hoàn tiền. Nhưng hai action này chưa tương đương các workflow nhiều bước của UI đổi/trả/đề xuất hoàn tiền.

## 5. P0 — sửa trước để chạy được luồng chính

### P0.1 Sản phẩm: lưu được toàn bộ form đang hiển thị

Đọc:
- Admin src/trading-ui/apis/product/product.interface.ts: ProductCreateRequestDto, ProductPatchRequestDto, ProductSkuCreateRequestDto.
- Admin src/apis/java/java-product.api.ts và java-product.mapper.ts.
- Admin src/trading-ui/pages/product/product-spu.
- Java AdminCreateProductRequestDto, AdminUpdateProductRequestDto, AdminSkuRequestDto và ProductServiceImpl.

Cần có persistence + response reload cho:
- SEO: metaTitle, metaDescription, metaKeywords.
- Đơn vị tính, loại sản phẩm bán lẻ; không tự nhận rồi bỏ qua unitOfMeasure.
- Thông tin bổ sung productInfos: title/description/sortOrder; description và thứ tự tab trên client.
- default SKU, thứ tự trục thuộc tính, SKU bindings và ảnh theo SKU.
- productMixMatch (mua kèm) đang có ở form.
- Thuế ghi đè/thuế danh mục và các trường giá SKU đang hiển thị: selling/compareAt/cost/B2B; thống nhất rõ giá sau thuế và đơn vị tiền.
- Trọng lượng/kích thước nếu form cho nhập. Trường nào ngoài scope phải xin owner quyết định; không silently drop.

Có thể giữ tên Java code/categoryId/variants thay vì bắt BE đổi sang spuCode/categoryUuid/skus, nhưng phải công bố mapping field-by-field, response đủ để mở lại form không mất dữ liệu. FE sẽ sửa adapter khi contract chốt.

Update code đang không được hỗ trợ: chọn rõ immutable và trả thông báo, hoặc hỗ trợ update có validate unique. Không báo lưu thành công khi người dùng đổi code nhưng server bỏ qua.

SKU update không được reset onHand về 0. Nhập tồn bằng API inventory, không lấy số tồn từ field giá/metadata. Tạo nháp không tự publish; owner được publish trực tiếp, không bắt workflow duyệt.

**Acceptance:** tạo từ form gốc đầy đủ → lưu nháp → GET mở lại đúng tất cả field → sửa một field → reload đúng → nhập tồn → publish → client detail/list đúng ảnh/SKU/giá/options → thêm giỏ được.

### P0.2 Danh mục và thuộc tính không làm mất dữ liệu

Đọc admin src/trading-ui/apis/category/category.interface.ts, attribute/attribute.interface.ts, collection/collection.interface.ts và src/apis/java/java-taxonomy.api.ts.

- Danh mục: code độc lập slug, parentId, image, status, taxRate, SEO và directAttributeIds nếu UI đang cho cấu hình.
- Thuộc tính: values là entity có ID number/code/value/image, displayType/status/isVariantAxis; không chỉ string[] nếu vẫn giữ đầy đủ UI.
- FE hiện chặn ảnh, code riêng khác value, inactive và non-variant-axis vì Java chưa lưu. Bổ sung CRUD/options response tương ứng rồi tháo guard trong adapter.
- Collection: không tự thêm bộ sưu tập mẫu; có xóa hợp lệ, quản lý membership và thứ tự; tránh gửi payload nhưng bỏ productIds.

**Acceptance:** tạo taxonomy → dùng picker tạo sản phẩm → mở sửa vẫn đúng; xóa có ràng buộc khi đang được tham chiếu.

### P0.3 CMS → banner/carousel → client

Đọc admin src/trading-ui/pages/content-display/cms, src/apis/java/java-cms.api.ts, src/trading-ui/apis/cms/cms-source.api.ts; client src/utils/api/content-backend; Java CmsServiceImpl.

- V4 đã có xử lý config.dataSource.filterType và collection/category/manual/new arrivals. Không làm lại từ đầu hoặc nói chưa có filterType.
- Kiểm thử đúng các giá trị từ product-carousel.schema.ts và cms-product-carousel-block.utils.ts trong src/trading-ui của repo admin.
- MANUAL_PRODUCTS dùng đúng productIds đã chọn, giữ thứ tự, không fallback random khi không có sản phẩm public.
- COLLECTION/CATEGORY đọc ID số hoặc slug đúng schema. Legacy productIds rỗng phải fallback collection khi config hợp lệ; không biến carousel thành rỗng nhầm.
- Block config/title/style/font/color/spacing/image/action được lưu và render đúng. Chỉ làm block đang có cả editor lẫn renderer, không thêm block tự chế.
- Page draft/inactive không public. Có delete page với ràng buộc/reference rõ ràng; hiện Java chỉ delete block.
- Giữ GET storefront/cms/... theo contract đang dùng; agent phải đọc URL adapter client thay vì đoán tên endpoint.

Banner: đọc admin src/trading-ui/apis/banner/banner.interface.ts, banner.entities.ts và src/apis/java/java-banner.api.ts.
- AdminBannerPlacementRequestDto hiện chỉ có code/name/displayType; ghi GRID không có nghĩa đã có grid layout persistence.
- Bổ sung placement layout/items: slotKey/bannerId/isActive/priority/displayMetadata và thời gian/platform/status theo interface đang dùng.
- Render trả đủ để client thể hiện SLIDER/GRID/DOUBLE_BANNER, không đổi mọi loại thành CAROUSEL.
- CRUD placement/layout có response reload; unbind không xóa banner content dùng nơi khác.
- URL ảnh upload public; render phải lọc status/time/platform đúng.
- Không thêm banner product-list ngoài scope đã chốt.

**Acceptance:** tạo page trống → add block → chọn banner/nguồn carousel bằng picker → publish tự về list → client hiển thị đúng; reorder/hide/unpublish reload đúng, không hiện mock.

### P0.4 Label hiển thị đúng sản phẩm/SKU

Đọc admin src/trading-ui/apis/badge, src/apis/java/java-badge-flow.api.ts; client src/utils/api/content-backend/content-badge.api.ts và java-badge.mapper.ts.

Template cần round-trip đầy đủ field design desktop/mobile. Flow cần giữ ruleType/ruleConfig/templates/activeFrom/activeTo/status/channel/priority/isPinned. Kiểm thử phạm vi all/category/collection/SKU; promotion rule chỉ chạy khi promotion có thật.

GET storefront/badge với list skuIds phải trả đúng SKU → labels; không trả tất cả label cho mọi sản phẩm. Status inactive/ngoài thời gian phải bị loại. Search/pagination/assignment count thiếu thì bổ sung sau P0, nhưng không bịa count.

### P0.5 COD → đơn hàng thật → xử lý/hủy

Đọc admin src/trading-ui/apis/order/order-java.adapter.ts, order-java-catalog.adapter.ts, pages/order/order-detail; client src/utils/api/java/java-checkout.api.ts, java-order.api.ts và cart adapter.

Giữ API hiện có nếu đúng behavior. Kiểm thử:
- Guest cart header nhận X-Guest-Cart-Id/x-guest-id; login merge không mất hoặc nhân đôi lines.
- Quote từ giá/tồn/voucher server; FE không tự quyết grandTotal.
- Guest/authenticated COD tạo đơn; frontend double-click guard không thay thế server idempotency.
- Retry cùng idempotency key không tạo hai đơn/giữ tồn hai lần; không kiểm thử bằng đổi key liên tục.
- Kiểm tra owner address/order, SKU public/qty/stock và voucher còn hiệu lực lúc đặt thật.
- PENDING → CONFIRMED → SHIPPING → DELIVERED có timeline đúng. Cancel/updateStatus(CANCELLED) đồng thời chỉ nhả tồn một lần bằng transaction/locking có test.
- Guest success không tự hiện nút lịch sử dành riêng account; authenticated mới xem lịch sử của mình.
- Online payment/MoMo đang ẩn, không thêm Payoo/Payo.

**Acceptance:** client mua COD → mở chi tiết được → admin thấy đúng order → xác nhận/giao/hoàn tất; một order khác hủy thì tồn nhả đúng. Có test cạnh tranh đồng thời, không chỉ test happy path.

## 6. P1 — các màn hình đã có UI nhưng thiếu backend workflow

### Header/footer

Đọc admin src/trading-ui/apis/cms/cms-header-footer.interface.ts, cms-header-footer.api.ts, navigation.api.ts và pages/content-display/header-footer; client component/header/footer và API đang gọi.

Cần top banner/logo/menu nhiều cấp/footer CRUD/status/sort/image/link + storefront read. Có thể đặt API Java dưới admin/cms và storefront/cms; gửi exact contract để FE map lại. Đường dẫn cms/admin/... trong API gốc không phải yêu cầu tạo microservice.

### Promotion

Đọc admin src/trading-ui/apis/promotion/promotion.interface.ts, promotion.entities.ts, promotion.enum.ts, promotion.api.ts và pages/promotion.

Java hiện chỉ flat discount/promotion/voucher CRUD. Wizard gốc cần draft thông tin chung → schemas → target/benefit/condition/audience/applicability → preview → publish → detail/lifecycle. Không map campaign nhiều schema thành một discount rồi đánh mất rule.

Ưu tiên đúng scope markdown/flat price/voucher; không bê toàn bộ engine công ty. Nêu field/schema nào ngoài scope để owner chốt. Preview/apply checkout phải dùng cùng rule, không preview một giá rồi đặt đơn giá khác.

### Bộ sản phẩm, đánh giá, các màn hình OMS mở rộng

- Set: admin src/trading-ui/apis/product-set và pages/product/product-set, client trang set tương ứng. Phân biệt bộ sản phẩm lưu sẵn với gợi ý dựng bộ theo nhu cầu. List/detail/delete và import gốc phải có contract; không tự chế form create khi source gốc không có.
- Review: lần theo pages/product/product-review và API import của page; client product-detail review. Cần moderation và storefront approved reviews, không mock rating/review count.
- Admin tạo/sửa/clone đơn: có UI/picker, nhưng cần quote/create/update thủ công, customer lookup/address/options/voucher phù hợp. Không giả dạng client checkout để đổi sai source/customer ownership.
- Shipping/return-exchange/refund-proposal/invoice: đọc các folder src/trading-ui/pages/shipping, order/returns-exchanges, refund-proposal, invoice và API/hook tương ứng. Nếu triển khai đầy đủ, cần state/response cho từng action; return/refund cơ bản không đủ. Đánh dấu module chưa trong phạm vi triển khai gần nhất, không trả success rỗng để FE tưởng đã xong.
- Pre-order hiện Java chỉ cấu hình list/create, không phải full campaign/edit/statistics/pre-order order workflow.
- Filter nâng cao PIM/OMS/promotion làm sau P0. Mỗi filter phải được xử lý thật hoặc trả lỗi rõ; counts phải cùng tập dữ liệu filter.
- Dashboard admin đang trả 404 admin/dashboard/overview trên Java local; cần API tổng quan hoặc quyết định ẩn khỏi scope, không dùng doanh thu mẫu.

## 7. Quy tắc contract và bàn giao

- Base URL/prefix cấu hình được; mặc định /api/v1. Không hardcode localhost trong business component.
- ID database dùng number. V4 vẫn có một số response ID là string (ví dụ ProductResponseDto.id có JsonFormat STRING, CustomerRequestResponseDto và badge references); FE chấp nhận normalize, nhưng BE phải ghi rõ wire type thực tế và kế hoạch thống nhất, không đổi sang UUID.
- Không tự tạo dữ liệu mẫu khi mở admin/client hoặc bật server. Không xóa dữ liệu để che migration lỗi.
- List có pagination/counts đúng; GET detail trả đủ dữ liệu để edit. Date/timestamp có tên và timezone rõ, không dùng epoch mặc định để làm như có dữ liệu.
- Error có code/message ổn định, HTTP status đúng. Unsupported không được trả 200 success.
- Entity tham chiếu/soft delete/stock transaction phải có ràng buộc và test. Auth/role/CORS credentials theo cấu hình thống nhất; không truy cập DB công ty.
- Migration dùng PostgreSQL riêng, upgrade DB hiện có an toàn. Không yêu cầu drop/reset toàn bộ DB để chạy.
- Sau sửa gửi bảng endpoint/method/query/body/response/error, mapping với type FE, migration và lệnh chạy test. Nếu tên API khác FE gốc, gửi mapping rõ ràng để sửa adapter; không yêu cầu FE bỏ behavior.
- Mục nào chưa làm ghi cụ thể. Không kết luận full luồng chỉ vì Swagger có endpoint hoặc Maven compile được.

## 8. Kiểm chứng trong lượt này

- Admin: npm run build thành công (còn lint/chunk warnings); 24 test files / 61 tests pass. Các test adapter stub HTTP kiểm tra mapping, không chứng minh transaction Java.
- Client: 96 test files / 613 tests pass; TypeScript check pass. Không chạy lại production build client trong lượt này.
- Admin browser với login Java local: đã render product-list/category/collection/attribute/CMS-list/edit/label/flow/order-list/promotion-list/customer-request/set/review và shipping/exchange/refund-proposal/invoice/order-create/product-create/promotion-create/header-navigation/banner; không thấy runtime JS exception trong các lượt kiểm tra. API thiếu được cảnh báo. Chỉ kiểm tra đọc, không tạo đơn/sản phẩm/page mới.
- Chưa test E2E toàn luồng với dữ liệu mới; chưa kiểm chứng mọi modal/viewport/mobile/visual pixel-by-pixel. Không cam kết giống 100% khi chưa có kết quả đó.
- Backend Java không bị sửa trong lượt này. Không commit/push.

## 9. Yêu cầu agent partner thực hiện

1. Đọc 4 source và đối chiếu từng P0 với DTO/service/database trước khi code.
2. Làm P0.1 → P0.2 → P0.3 → P0.4 → P0.5; phần filter/P1 sau. Giữ scope mùa vụ không bắt buộc, chưa làm bao bì/POS/online payment.
3. Mỗi mục phải có persistence + response + test + migration nếu cần; không chỉ thêm field vào DTO.
4. Chạy build/test Java và test round-trip/luồng bằng DB riêng. Ghi kết quả thật, không nói đã test nếu chỉ đọc code.
5. Trả report những mục hoàn tất/còn thiếu và exact contract. FE sẽ tiếp tục nối/tháo guards sau khi BE có implementation thật.
