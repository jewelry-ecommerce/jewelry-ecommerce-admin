import {
  AddRounded,
  CalendarMonthOutlined,
  EditOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
  FilterListOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { CATEGORIES, COLLECTIONS, PRODUCTS } from "@/mocks/data/catalog.data";
import { CUSTOMERS } from "@/mocks/data/customer.data";
import { STOCK_LEVELS, WAREHOUSES } from "@/mocks/data/inventory.data";
import { ORDERS } from "@/mocks/data/order.data";
import { PROMOTIONS, VOUCHERS } from "@/mocks/data/promotion.data";
import { CURATED_SETS } from "@/mocks/data/set.data";
import { CustomButton } from "@/components/button/custom-button.component";
import {
  DataTable,
  DataTableContentCard,
  DataTableFilterCard,
  DataTablePagination,
  DataTableStatusTabs,
  DataTableToolbar,
  type DataTableColumn,
} from "@/components/data-table";
import { ItemImage } from "@/components/item-image/item-image.component";
import { StatusPill } from "@/components/status-pill/status-pill.component";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { COLOR, type StatusTone } from "@/theme/design-tokens";
import { STYLE } from "@/theme/design-tokens";

type CellValue = string | number | null;
type ModuleRow = { id: string; image?: string; status?: string } & Record<string, CellValue | undefined>;
type ModuleDefinition = {
  title: string;
  description: string;
  createLabel: string;
  imageLabel?: string;
  columns: string[];
  rows: ModuleRow[];
};

const currency = (value: number): string => `${new Intl.NumberFormat("vi-VN").format(value)} đ`;
const date = (value: string): string => new Intl.DateTimeFormat("vi-VN").format(new Date(value));

const toProductRows = (): ModuleRow[] =>
  PRODUCTS.map((product) => ({
    id: product.id,
    image: product.media[0]?.url,
    code: product.code,
    name: product.name,
    category: product.category.name,
    price: currency(product.priceFrom),
    stock: product.variants.reduce((sum, item) => sum + item.availableStock, 0),
    status: product.status,
  }));

const toCategoryRows = (): ModuleRow[] =>
  CATEGORIES.map((category) => ({
    id: category.id,
    image: category.image,
    code: category.slug,
    name: category.name,
    products: category.productCount,
    status: "ACTIVE",
  }));

const toCollectionRows = (): ModuleRow[] =>
  COLLECTIONS.map((collection) => ({
    id: collection.id,
    image: collection.heroImage,
    code: collection.slug,
    name: collection.name,
    products: collection.productIds.length,
    status: collection.status,
  }));

const toSetRows = (): ModuleRow[] =>
  CURATED_SETS.map((set) => ({
    id: set.id,
    image: set.heroImage,
    code: set.code,
    name: set.name,
    items: set.items.length,
    discount: `${set.bundleDiscountPercent}%`,
    stock: set.stockStatus,
    status: set.status,
  }));

const toOrderRows = (): ModuleRow[] =>
  ORDERS.map((order) => ({
    id: order.id,
    code: order.code,
    customer: order.customerName,
    phone: order.customerPhone,
    items: order.lines.length,
    total: currency(order.totals.grandTotal),
    payment: order.paymentMethod,
    status: order.status,
    created: date(order.placedAt),
  }));

const toPromotionRows = (vouchers = false): ModuleRow[] =>
  (vouchers ? VOUCHERS : PROMOTIONS).map((entry) => ({
    id: entry.id,
    code: entry.code,
    name: entry.name,
    discount: entry.discountType === "PERCENT" ? `${entry.discountValue}%` : currency(entry.discountValue),
    start: date(entry.startAt),
    end: date(entry.endAt),
    status: entry.status,
  }));

const toCustomerRows = (): ModuleRow[] =>
  CUSTOMERS.map((customer) => ({
    id: customer.id,
    image: customer.avatar ?? undefined,
    code: customer.code,
    name: customer.fullName,
    phone: customer.phone,
    email: customer.email,
    tier: customer.tier,
    orders: customer.orderCount,
    total: currency(customer.lifetimeValue),
    status: customer.tier,
  }));

const toStockRows = (): ModuleRow[] =>
  STOCK_LEVELS.map((stock) => ({
    id: `${stock.warehouseId}-${stock.skuCode}`,
    code: stock.skuCode,
    name: stock.productName,
    warehouse: stock.warehouseCode,
    onHand: stock.onHand,
    reserved: stock.reserved,
    available: stock.available,
    status: stock.available <= stock.reorderPoint ? "LOW_STOCK" : "IN_STOCK",
  }));

const toWarehouseRows = (): ModuleRow[] =>
  WAREHOUSES.map((warehouse) => ({
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
    city: warehouse.city,
    address: warehouse.address,
    status: warehouse.isActive ? "ACTIVE" : "INACTIVE",
  }));

const genericRows = (): ModuleRow[] => [
  { id: "demo-1", code: "DEMO-001", name: "Dữ liệu demo Jewelry Ecommerce", status: "ACTIVE", created: "16/09/2026" },
];

const moduleFromPath = (pathname: string): ModuleDefinition => {
  if (pathname.startsWith("/collections"))
    return {
      title: "Danh sách bộ sưu tập",
      description: "Quản lý bộ sưu tập hiển thị trên cửa hàng.",
      createLabel: "Tạo bộ sưu tập",
      imageLabel: "Ảnh",
      columns: ["code", "name", "products", "status"],
      rows: toCollectionRows(),
    };
  if (pathname.startsWith("/categories"))
    return {
      title: "Danh sách danh mục",
      description: "Quản lý danh mục sản phẩm.",
      createLabel: "Tạo danh mục",
      imageLabel: "Ảnh",
      columns: ["code", "name", "products", "status"],
      rows: toCategoryRows(),
    };
  if (pathname.startsWith("/products"))
    return {
      title: "Danh sách sản phẩm",
      description: "Quản lý danh mục, SKU và trạng thái bán hàng.",
      createLabel: "Tạo sản phẩm",
      imageLabel: "Ảnh",
      columns: ["code", "name", "category", "price", "stock", "status"],
      rows: toProductRows(),
    };
  if (pathname.startsWith("/sets"))
    return {
      title: "Danh sách bộ sản phẩm",
      description: "Quản lý Stella Set và cấu hình sản phẩm trong bộ.",
      createLabel: "Tạo bộ sản phẩm",
      imageLabel: "Ảnh",
      columns: ["code", "name", "items", "discount", "stock", "status"],
      rows: toSetRows(),
    };
  if (pathname.startsWith("/orders"))
    return {
      title: "Danh sách đơn hàng",
      description: "Theo dõi đơn hàng, thanh toán và trạng thái xử lý.",
      createLabel: "Tạo đơn hàng",
      columns: ["code", "customer", "phone", "items", "total", "payment", "status", "created"],
      rows: toOrderRows(),
    };
  if (pathname.startsWith("/vouchers"))
    return {
      title: "Danh sách voucher",
      description: "Quản lý mã giảm giá áp dụng tại checkout.",
      createLabel: "Tạo voucher",
      columns: ["code", "name", "discount", "start", "end", "status"],
      rows: toPromotionRows(true),
    };
  if (pathname.startsWith("/promotions"))
    return {
      title: "Danh sách khuyến mãi",
      description: "Thiết lập chương trình khuyến mãi theo sản phẩm và đơn hàng.",
      createLabel: "Tạo khuyến mãi",
      columns: ["code", "name", "discount", "start", "end", "status"],
      rows: toPromotionRows(),
    };
  if (pathname.startsWith("/customers"))
    return {
      title: "Danh sách khách hàng",
      description: "Thông tin khách hàng, hạng thành viên và lịch sử mua.",
      createLabel: "Thêm khách hàng",
      imageLabel: "Ảnh",
      columns: ["code", "name", "phone", "email", "tier", "orders", "total"],
      rows: toCustomerRows(),
    };
  if (pathname === "/inventory/warehouses")
    return {
      title: "Danh sách kho",
      description: "Quản lý kho và địa điểm lưu trữ hàng hóa.",
      createLabel: "Tạo kho",
      columns: ["code", "name", "city", "address", "status"],
      rows: toWarehouseRows(),
    };
  if (pathname.startsWith("/inventory"))
    return {
      title: "Tồn kho sản phẩm",
      description: "Theo dõi tồn thực tế, hàng giữ chỗ và mức cần nhập thêm.",
      createLabel: "Điều chỉnh tồn kho",
      columns: ["code", "name", "warehouse", "onHand", "reserved", "available", "status"],
      rows: toStockRows(),
    };
  return {
    title: "Quản lý dữ liệu",
    description: "Dữ liệu mô phỏng phục vụ demo đồ án.",
    createLabel: "Tạo mới",
    columns: ["code", "name", "created", "status"],
    rows: genericRows(),
  };
};

const statusTone = (status?: string): StatusTone => {
  if (["PUBLISHED", "ACTIVE", "CONFIRMED", "DELIVERED", "IN_STOCK", "GOLD", "DIAMOND"].includes(status ?? "")) return "success";
  if (["DRAFT", "PENDING", "PREPARING", "LOW_STOCK", "SCHEDULED", "SILVER"].includes(status ?? "")) return "warning";
  if (["ARCHIVED", "CANCELLED", "EXPIRED", "OUT_OF_STOCK", "REFUNDED"].includes(status ?? "")) return "danger";
  return "neutral";
};

const labelFor = (field: string): string =>
  ({
    code: "Mã",
    name: "Tên",
    category: "Danh mục",
    price: "Giá bán",
    stock: "Tồn kho",
    items: "Số sản phẩm",
    products: "Số sản phẩm",
    discount: "Ưu đãi",
    customer: "Khách hàng",
    phone: "Số điện thoại",
    total: "Tổng tiền",
    payment: "Thanh toán",
    created: "Thời gian tạo",
    start: "Bắt đầu",
    end: "Kết thúc",
    tier: "Hạng thành viên",
    orders: "Số đơn",
    warehouse: "Kho",
    onHand: "Tồn thực tế",
    reserved: "Đang giữ",
    available: "Có thể bán",
    city: "Tỉnh/Thành",
    address: "Địa chỉ",
  })[field] ?? field;

const columnsFor = (definition: ModuleDefinition): DataTableColumn<ModuleRow>[] => {
  const base = definition.columns.map((field) => ({
    id: field,
    label: labelFor(field),
    minWidth: field === "name" || field === "customer" ? 220 : 130,
    renderCell: (row: ModuleRow) => (
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: COLOR.NEUTRAL[800] }}>{String(row[field] ?? "—")}</Typography>
    ),
  }));
  const imageColumn = definition.imageLabel
    ? [
        {
          id: "image",
          label: definition.imageLabel,
          width: 92,
          renderCell: (row: ModuleRow) => <ItemImage src={row.image} alt={String(row.name ?? "")} size={44} />,
        },
      ]
    : [];
  const statusColumn = base.map((column) =>
    column.id === "status"
      ? {
          ...column,
          renderCell: (row: ModuleRow) => <StatusPill label={String(row.status ?? "—")} tone={statusTone(row.status)} withDot={false} />,
        }
      : column,
  );
  return [
    ...imageColumn,
    ...statusColumn,
    {
      id: "actions",
      label: "",
      width: 104,
      sticky: "right",
      renderCell: () => (
        <Stack direction="row" spacing={0.25}>
          <VisibilityOutlined fontSize="small" />
          <EditOutlined fontSize="small" />
        </Stack>
      ),
    },
  ];
};

const ModuleListPage = () => {
  const { pathname } = useLocation();
  const definition = useMemo(() => moduleFromPath(pathname), [pathname]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const rows = definition.rows.filter((row) => {
    const matchedStatus = status === "ALL" || row.status === status;
    return (
      matchedStatus &&
      Object.values(row).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    );
  });
  const statuses = [
    "ALL",
    ...Array.from(new Set(definition.rows.map((row) => row.status).filter((value): value is string => Boolean(value)))),
  ];
  const tabs = statuses.map((value) => ({
    value,
    label: value === "ALL" ? "Tất cả" : value,
    count: value === "ALL" ? definition.rows.length : definition.rows.filter((row) => row.status === value).length,
  }));

  const actions = [
    { key: "time", label: "Thời gian", variant: "outline" as const, icon: <CalendarMonthOutlined fontSize="small" /> },
    { key: "filter", label: "Bộ lọc", variant: "outline" as const, icon: <FilterListOutlined fontSize="small" /> },
    { key: "import", label: "Import", variant: "outline" as const, icon: <FileUploadOutlined fontSize="small" /> },
    { key: "export", label: "Export", variant: "outline" as const, icon: <FileDownloadOutlined fontSize="small" /> },
    {
      key: "create",
      label: definition.createLabel,
      variant: "primary" as const,
      customNode: (
        <CustomButton variant="primary" startIcon={<AddRounded />}>
          {definition.createLabel}
        </CustomButton>
      ),
    },
  ];

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: "border-box", minHeight: 0 }}>
      <WrapperComponent label={definition.title} tabs={<DataTableStatusTabs tabs={tabs} activeValue={status} onChange={setStatus} />}>
        <Stack gap={2} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          <DataTableFilterCard>
            <DataTableToolbar
              embedded
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Tìm theo mã, tên, khách hàng..."
              actions={actions}
            />
          </DataTableFilterCard>
          <DataTableContentCard>
            <DataTable
              rows={rows}
              columns={columnsFor(definition)}
              getRowId={(row) => row.id}
              selectable
              tableMinWidth={960}
              containerSx={{ height: "100%", minHeight: 0 }}
              emptyTitle="Không có dữ liệu"
              emptyDescription="Thử thay đổi điều kiện tìm kiếm."
            />
          </DataTableContentCard>
          <DataTablePagination
            page={1}
            pageSize={20}
            totalItems={rows.length}
            itemLabel="bản ghi"
            onPageChange={() => undefined}
            onPageSizeChange={() => undefined}
          />
        </Stack>
      </WrapperComponent>
    </Stack>
  );
};

export default ModuleListPage;
