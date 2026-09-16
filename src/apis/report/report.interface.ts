import type { OrderStatus, PaymentMethod } from "@/apis/order/order.interface";
import type { MembershipTier } from "@/apis/customer/customer.interface";

export type ReportRange = {
  fromDate?: string;
  toDate?: string;
};

export type ReportSeries = {
  labels: string[];
  series: { name: string; values: number[] }[];
};

export type SalesReport = {
  range: ReportRange;
  grossRevenue: number;
  netRevenue: number;
  discountTotal: number;
  orderCount: number;
  averageOrderValue: number;
  revenueByDay: ReportSeries;
  revenueByPaymentMethod: { paymentMethod: PaymentMethod; revenue: number; orderCount: number }[];
};

export type OrderReport = {
  range: ReportRange;
  byStatus: { status: OrderStatus; count: number; revenue: number }[];
  fulfilmentRate: number;
  cancellationRate: number;
  returnRate: number;
};

export type ProductReportRow = {
  productId: string;
  productName: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
  /** Units still available across every warehouse. */
  availableStock: number;
};

export type InventoryReport = {
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
  lowStockSkuCount: number;
  byWarehouse: { warehouseCode: string; onHand: number; reserved: number; available: number }[];
};

export type CustomerReport = {
  totalCustomers: number;
  newCustomers: number;
  repeatPurchaseRate: number;
  byTier: { tier: MembershipTier; customerCount: number; lifetimeValue: number }[];
  topCustomers: { customerId: string; customerName: string; orderCount: number; lifetimeValue: number }[];
};
