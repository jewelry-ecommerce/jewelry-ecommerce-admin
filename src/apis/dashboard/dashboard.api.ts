import type {
  DashboardKpi,
  DashboardLowStockRow,
  DashboardOverview,
  DashboardRange,
  DashboardRecentOrder,
  DashboardSeries,
  DashboardTopProductRow,
} from "@/apis/dashboard/dashboard.interface";
import type { Order, OrderStatus } from "@/apis/order/order.interface";
import { apiRequest } from "@/apis/transport";
import { findProductById } from "@/mocks/data/catalog.data";
import { CUSTOMERS } from "@/mocks/data/customer.data";
import { STOCK_LEVELS } from "@/mocks/data/inventory.data";
import { ORDERS } from "@/mocks/data/order.data";
import { cloneDeep, seededSequence, withLatency } from "@/mocks/mock-transport";

const REVENUE_STATUSES: OrderStatus[] = ["CONFIRMED", "PREPARING", "PACKED", "SHIPPING", "DELIVERED"];

const RANGE_POINTS: Record<DashboardRange, number> = {
  LAST_7_DAYS: 7,
  LAST_30_DAYS: 30,
  LAST_12_MONTHS: 12,
};

/** Length of the "new customer" window per range, in days. */
const RANGE_WINDOW_DAYS: Record<DashboardRange, number> = {
  LAST_7_DAYS: 7,
  LAST_30_DAYS: 30,
  LAST_12_MONTHS: 365,
};

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const TOP_PRODUCT_LIMIT = 5;

/**
 * Registrations inside the range window.
 *
 * The window is anchored on the newest fixture record rather than on the wall clock, so the number is
 * reproducible no matter when the demo runs.
 */
const countNewCustomers = (range: DashboardRange): number => {
  const timestamps = CUSTOMERS.map((customer) => new Date(customer.createdAt).getTime()).filter((value) => Number.isFinite(value));
  if (timestamps.length === 0) return 0;

  const anchor = Math.max(...timestamps);
  const from = anchor - RANGE_WINDOW_DAYS[range] * MILLISECONDS_PER_DAY;
  return timestamps.filter((value) => value >= from).length;
};

/** Revenue-ranked best sellers, aggregated from the lines of revenue-bearing orders. */
const buildTopProducts = (limit = TOP_PRODUCT_LIMIT): DashboardTopProductRow[] => {
  const totals = new Map<string, { unitsSold: number; revenue: number }>();

  ORDERS.filter((order) => REVENUE_STATUSES.includes(order.status)).forEach((order) =>
    order.lines.forEach((line) => {
      const current = totals.get(line.productId) ?? { unitsSold: 0, revenue: 0 };
      totals.set(line.productId, { unitsSold: current.unitsSold + line.quantity, revenue: current.revenue + line.lineTotal });
    }),
  );

  return [...totals.entries()]
    .map(([productId, { unitsSold, revenue }]) => {
      const product = findProductById(productId);
      return {
        productId,
        productName: product?.name ?? productId,
        categoryName: product?.category.name ?? "—",
        image: product?.media.find((asset) => asset.isPrimary)?.url ?? product?.media[0]?.url ?? "",
        unitsSold,
        revenue,
      };
    })
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, limit);
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const buildRangeLabels = (range: DashboardRange): string[] => {
  const count = RANGE_POINTS[range];
  if (range === "LAST_12_MONTHS") return MONTH_LABELS;
  return Array.from({ length: count }, (_, index) => `D-${count - index - 1}`);
};

/**
 * Revenue trend. Actual order revenue anchors the last point so the chart and the KPI agree, while
 * earlier points come from a seeded sequence — deterministic, so the chart does not flicker.
 */
const buildRevenueSeries = (range: DashboardRange, actualRevenue: number): DashboardSeries => {
  const labels = buildRangeLabels(range);
  const values = seededSequence(`revenue-${range}`, labels.length, Math.round(actualRevenue * 0.45), Math.round(actualRevenue * 1.15));
  values[values.length - 1] = actualRevenue;

  const orderValues = seededSequence(`orders-${range}`, labels.length, 4, 26);
  return {
    labels,
    series: [
      { name: "Revenue", values },
      { name: "Orders", values: orderValues },
    ],
  };
};

const toRecentOrder = (order: Order): DashboardRecentOrder => ({
  code: order.code,
  customerName: order.customerName,
  status: order.status,
  paymentStatus: order.paymentStatus,
  channel: order.channel,
  grandTotal: order.totals.grandTotal,
  placedAt: order.placedAt,
});

const buildKpis = (revenue: number, orderCount: number, newCustomerCount: number): DashboardKpi[] => [
  {
    key: "net_revenue",
    label: "Net revenue",
    value: revenue,
    deltaPercent: 12.4,
    deltaTone: "success",
    format: "CURRENCY",
    caption: "Confirmed through delivered orders",
  },
  {
    key: "order_count",
    label: "Orders",
    value: orderCount,
    deltaPercent: 6.1,
    deltaTone: "success",
    format: "NUMBER",
    caption: "Excluding cancelled and refunded",
  },
  {
    key: "average_order_value",
    label: "Average order value",
    value: orderCount === 0 ? 0 : Math.round(revenue / orderCount),
    deltaPercent: -2.8,
    deltaTone: "danger",
    format: "CURRENCY",
    caption: "Net revenue divided by orders",
  },
  {
    key: "new_customers",
    label: "New customers",
    value: newCustomerCount,
    deltaPercent: 3.5,
    deltaTone: "success",
    format: "NUMBER",
    caption: "Accounts registered in this period",
  },
];

const toLowStockRow = (): DashboardLowStockRow[] =>
  STOCK_LEVELS.filter((level) => level.available <= level.reorderPoint)
    .sort((left, right) => left.available - right.available)
    .slice(0, 8)
    .map((level) => ({
      skuCode: level.skuCode,
      productName: level.productName,
      variantLabel: level.variantLabel,
      warehouseCode: level.warehouseCode,
      available: level.available,
      reorderPoint: level.reorderPoint,
    }));

/** GET admin/dashboard/overview */
export const getOverview = (range: DashboardRange = "LAST_30_DAYS"): Promise<DashboardOverview> =>
  apiRequest({
    method: "GET",
    path: "admin/dashboard/overview",
    query: { range },
    mock: () =>
      withLatency(() => {
        const revenueOrders = ORDERS.filter((order) => REVENUE_STATUSES.includes(order.status));
        const revenue = revenueOrders.reduce((sum, order) => sum + order.totals.grandTotal, 0);
        const lowStock = toLowStockRow();
        const statuses = [...new Set(ORDERS.map((order) => order.status))];

        return {
          kpis: buildKpis(revenue, revenueOrders.length, countNewCustomers(range)),
          revenue: buildRevenueSeries(range, revenue),
          ordersByStatus: statuses.map((status) => ({ status, count: ORDERS.filter((order) => order.status === status).length })),
          recentOrders: cloneDeep(
            [...ORDERS]
              .sort((left, right) => right.placedAt.localeCompare(left.placedAt))
              .slice(0, 8)
              .map(toRecentOrder),
          ),
          lowStock,
          topProducts: buildTopProducts(),
        };
      }),
  });

/** GET admin/dashboard/revenue */
export const getRevenueSeries = (range: DashboardRange = "LAST_30_DAYS"): Promise<DashboardSeries> =>
  apiRequest({
    method: "GET",
    path: "admin/dashboard/revenue",
    query: { range },
    mock: () =>
      withLatency(() => {
        const revenue = ORDERS.filter((order) => REVENUE_STATUSES.includes(order.status)).reduce(
          (sum, order) => sum + order.totals.grandTotal,
          0,
        );
        return buildRevenueSeries(range, revenue);
      }),
  });

/** GET admin/dashboard/recent-orders */
export const getRecentOrders = (limit = 8): Promise<DashboardRecentOrder[]> =>
  apiRequest({
    method: "GET",
    path: "admin/dashboard/recent-orders",
    query: { limit },
    mock: () =>
      withLatency(() =>
        cloneDeep(
          [...ORDERS]
            .sort((left, right) => right.placedAt.localeCompare(left.placedAt))
            .slice(0, limit)
            .map(toRecentOrder),
        ),
      ),
  });

/** GET admin/dashboard/low-stock */
export const getLowStock = (): Promise<DashboardLowStockRow[]> =>
  apiRequest({
    method: "GET",
    path: "admin/dashboard/low-stock",
    mock: () => withLatency(() => toLowStockRow()),
  });

/** GET admin/dashboard/top-products */
export const getTopProducts = (limit = TOP_PRODUCT_LIMIT): Promise<DashboardTopProductRow[]> =>
  apiRequest({
    method: "GET",
    path: "admin/dashboard/top-products",
    query: { limit },
    mock: () => withLatency(() => buildTopProducts(limit)),
  });
