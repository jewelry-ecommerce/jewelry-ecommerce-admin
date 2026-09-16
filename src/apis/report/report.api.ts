import type { MembershipTier } from "@/apis/customer/customer.interface";
import type { Order, OrderStatus, PaymentMethod } from "@/apis/order/order.interface";
import type {
  CustomerReport,
  InventoryReport,
  OrderReport,
  ProductReportRow,
  ReportRange,
  ReportSeries,
  SalesReport,
} from "@/apis/report/report.interface";
import { apiRequest } from "@/apis/transport";
import { findProductById } from "@/mocks/data/catalog.data";
import { CUSTOMERS, MEMBERSHIP_TIER_LABELS } from "@/mocks/data/customer.data";
import { STOCK_LEVELS, WAREHOUSES } from "@/mocks/data/inventory.data";
import { ORDERS } from "@/mocks/data/order.data";
import { cloneDeep, withLatency } from "@/mocks/mock-transport";

const REVENUE_STATUSES: OrderStatus[] = ["CONFIRMED", "PREPARING", "PACKED", "SHIPPING", "DELIVERED"];
const PAYMENT_METHODS: PaymentMethod[] = ["COD", "BANK_TRANSFER", "CREDIT_CARD", "E_WALLET"];

const inRange = (order: Order, range: ReportRange): boolean => {
  if (range.fromDate && order.placedAt < range.fromDate) return false;
  if (range.toDate && order.placedAt > range.toDate) return false;
  return true;
};

const toDayKey = (isoDate: string): string => isoDate.slice(0, 10);

const buildRevenueByDay = (orders: Order[]): ReportSeries => {
  const totals = new Map<string, number>();
  orders.forEach((order) => {
    const key = toDayKey(order.placedAt);
    totals.set(key, (totals.get(key) ?? 0) + order.totals.grandTotal);
  });

  const labels = [...totals.keys()].sort();
  return { labels, series: [{ name: "Revenue", values: labels.map((label) => totals.get(label) ?? 0) }] };
};

const percentOf = (part: number, whole: number): number => (whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10);

/** GET admin/reports/sales */
export const getSalesReport = (range: ReportRange = {}): Promise<SalesReport> =>
  apiRequest({
    method: "GET",
    path: "admin/reports/sales",
    query: { ...range },
    mock: () =>
      withLatency(() => {
        const matched = ORDERS.filter((order) => inRange(order, range));
        const revenueOrders = matched.filter((order) => REVENUE_STATUSES.includes(order.status));
        const grossRevenue = revenueOrders.reduce((sum, order) => sum + order.totals.subtotal, 0);
        const discountTotal = revenueOrders.reduce(
          (sum, order) => sum + order.totals.productDiscount + order.totals.voucherDiscount + order.totals.loyaltyDiscount,
          0,
        );
        const netRevenue = revenueOrders.reduce((sum, order) => sum + order.totals.grandTotal, 0);

        return {
          range,
          grossRevenue,
          netRevenue,
          discountTotal,
          orderCount: revenueOrders.length,
          averageOrderValue: revenueOrders.length === 0 ? 0 : Math.round(netRevenue / revenueOrders.length),
          revenueByDay: buildRevenueByDay(revenueOrders),
          revenueByPaymentMethod: PAYMENT_METHODS.map((paymentMethod) => {
            const rows = revenueOrders.filter((order) => order.paymentMethod === paymentMethod);
            return { paymentMethod, revenue: rows.reduce((sum, order) => sum + order.totals.grandTotal, 0), orderCount: rows.length };
          }),
        };
      }),
  });

/** GET admin/reports/orders */
export const getOrderReport = (range: ReportRange = {}): Promise<OrderReport> =>
  apiRequest({
    method: "GET",
    path: "admin/reports/orders",
    query: { ...range },
    mock: () =>
      withLatency(() => {
        const matched = ORDERS.filter((order) => inRange(order, range));
        const statuses = [...new Set(matched.map((order) => order.status))];

        return {
          range,
          byStatus: statuses.map((status) => {
            const rows = matched.filter((order) => order.status === status);
            return { status, count: rows.length, revenue: rows.reduce((sum, order) => sum + order.totals.grandTotal, 0) };
          }),
          fulfilmentRate: percentOf(matched.filter((order) => order.status === "DELIVERED").length, matched.length),
          cancellationRate: percentOf(matched.filter((order) => order.status === "CANCELLED").length, matched.length),
          returnRate: percentOf(
            matched.filter((order) => order.status === "RETURNED" || order.status === "RETURN_REQUESTED").length,
            matched.length,
          ),
        };
      }),
  });

/** GET admin/reports/products */
export const getProductReport = (range: ReportRange = {}): Promise<ProductReportRow[]> =>
  apiRequest({
    method: "GET",
    path: "admin/reports/products",
    query: { ...range },
    mock: () =>
      withLatency(() => {
        const matched = ORDERS.filter((order) => inRange(order, range) && REVENUE_STATUSES.includes(order.status));
        const totals = new Map<string, { unitsSold: number; revenue: number }>();

        matched.forEach((order) =>
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
              unitsSold,
              revenue,
              availableStock: STOCK_LEVELS.filter((level) => level.productId === productId).reduce(
                (sum, level) => sum + level.available,
                0,
              ),
            };
          })
          .sort((left, right) => right.revenue - left.revenue);
      }),
  });

/** GET admin/reports/inventory */
export const getInventoryReport = (): Promise<InventoryReport> =>
  apiRequest({
    method: "GET",
    path: "admin/reports/inventory",
    mock: () =>
      withLatency(() => ({
        totalOnHand: STOCK_LEVELS.reduce((sum, level) => sum + level.onHand, 0),
        totalReserved: STOCK_LEVELS.reduce((sum, level) => sum + level.reserved, 0),
        totalAvailable: STOCK_LEVELS.reduce((sum, level) => sum + level.available, 0),
        lowStockSkuCount: STOCK_LEVELS.filter((level) => level.available <= level.reorderPoint).length,
        byWarehouse: WAREHOUSES.map((warehouse) => {
          const rows = STOCK_LEVELS.filter((level) => level.warehouseId === warehouse.id);
          return {
            warehouseCode: warehouse.code,
            onHand: rows.reduce((sum, level) => sum + level.onHand, 0),
            reserved: rows.reduce((sum, level) => sum + level.reserved, 0),
            available: rows.reduce((sum, level) => sum + level.available, 0),
          };
        }),
      })),
  });

/** GET admin/reports/customers */
export const getCustomerReport = (range: ReportRange = {}): Promise<CustomerReport> =>
  apiRequest({
    method: "GET",
    path: "admin/reports/customers",
    query: { ...range },
    mock: () =>
      withLatency(() => ({
        totalCustomers: CUSTOMERS.length,
        newCustomers: CUSTOMERS.filter((customer) => (range.fromDate ? customer.createdAt >= range.fromDate : true)).length,
        repeatPurchaseRate: percentOf(CUSTOMERS.filter((customer) => customer.orderCount > 1).length, CUSTOMERS.length),
        byTier: (Object.keys(MEMBERSHIP_TIER_LABELS) as MembershipTier[]).map((tier) => {
          const rows = CUSTOMERS.filter((customer) => customer.tier === tier);
          return { tier, customerCount: rows.length, lifetimeValue: rows.reduce((sum, customer) => sum + customer.lifetimeValue, 0) };
        }),
        topCustomers: cloneDeep(
          [...CUSTOMERS]
            .sort((left, right) => right.lifetimeValue - left.lifetimeValue)
            .slice(0, 5)
            .map((customer) => ({
              customerId: customer.id,
              customerName: customer.fullName,
              orderCount: customer.orderCount,
              lifetimeValue: customer.lifetimeValue,
            })),
        ),
      })),
  });
