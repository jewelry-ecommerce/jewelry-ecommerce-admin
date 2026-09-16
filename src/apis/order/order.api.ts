import type {
  CancelOrderPayload,
  Order,
  OrderListQuery,
  OrderListResult,
  OrderRow,
  OrderStatus,
  OrderStatusCount,
  RefundOrderPayload,
  ReturnOrderPayload,
  UpdateOrderStatusPayload,
} from "@/apis/order/order.interface";
import { apiRequest } from "@/apis/transport";
import { findOrderByCode, ORDERS } from "@/mocks/data/order.data";
import { cloneDeep, matchesSearch, MockApiError, normalizeSearch, withLatency } from "@/mocks/mock-transport";

const DEFAULT_ACTOR = "admin.console";

const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "PACKED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
  "DELIVERY_FAILED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUND_PENDING",
  "REFUNDED",
];

const toOrderRow = (order: Order): OrderRow => ({
  id: order.id,
  code: order.code,
  status: order.status,
  channel: order.channel,
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  isGuest: order.isGuest,
  lineCount: order.lines.length,
  itemCount: order.lines.reduce((sum, line) => sum + line.quantity, 0),
  grandTotal: order.totals.grandTotal,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  shippingMethod: order.shippingMethod,
  trackingCode: order.trackingCode,
  isPreOrder: order.isPreOrder,
  placedAt: order.placedAt,
  updatedAt: order.updatedAt,
});

const filterOrders = (query: OrderListQuery): Order[] => {
  const search = normalizeSearch(query.search);

  return ORDERS.filter((order) => {
    if (query.status && query.status !== "ALL" && order.status !== query.status) return false;
    if (query.paymentStatus && order.paymentStatus !== query.paymentStatus) return false;
    if (query.channel && order.channel !== query.channel) return false;
    if (query.fromDate && order.placedAt < query.fromDate) return false;
    if (query.toDate && order.placedAt > query.toDate) return false;
    return matchesSearch([order.code, order.customerName, order.customerPhone, order.customerEmail, order.trackingCode], search);
  });
};

const buildStatusCounts = (rows: Order[]): OrderStatusCount[] => [
  { status: "ALL", count: rows.length },
  ...ORDER_STATUS_SEQUENCE.map((status) => ({ status, count: rows.filter((order) => order.status === status).length })),
];

const requireOrder = (code: string): Order => {
  const order = findOrderByCode(code);
  if (!order) throw new MockApiError("ORDER_NOT_FOUND", `No order matches the code ${code}.`, 404);
  return order;
};

const appendTimeline = (order: Order, status: OrderStatus, note: string, actor: string): void => {
  const occurredAt = new Date().toISOString();
  order.timeline.push({ id: `${order.id}-tl${order.timeline.length + 1}`, status, occurredAt, note, actor });
  order.status = status;
  order.updatedAt = occurredAt;
};

/** GET admin/orders */
export const getOrderList = (query: OrderListQuery = {}): Promise<OrderListResult> =>
  apiRequest({
    method: "GET",
    path: "admin/orders",
    query: { ...query },
    mock: () =>
      withLatency(() => {
        const matchedByFilters = filterOrders({ ...query, status: "ALL" });
        const matched = filterOrders(query).sort((left, right) => right.placedAt.localeCompare(left.placedAt));
        const page = Math.max(1, query.page ?? 1);
        const take = Math.max(1, query.take ?? 20);
        const start = (page - 1) * take;

        return {
          list: matched.slice(start, start + take).map(toOrderRow),
          total: matched.length,
          page,
          take,
          statusCounts: buildStatusCounts(matchedByFilters),
        };
      }),
  });

/** GET admin/orders/{code} */
export const getOrderDetail = (code: string): Promise<Order> =>
  apiRequest({
    method: "GET",
    path: `admin/orders/${encodeURIComponent(code)}`,
    mock: () => withLatency(() => cloneDeep(requireOrder(code))),
  });

/** PATCH admin/orders/{code}/status */
export const updateOrderStatus = ({ code, status, note, trackingCode, actor = DEFAULT_ACTOR }: UpdateOrderStatusPayload): Promise<Order> =>
  apiRequest({
    method: "PATCH",
    path: `admin/orders/${encodeURIComponent(code)}/status`,
    body: { status, note, trackingCode },
    mock: () =>
      withLatency(() => {
        const order = requireOrder(code);
        if (order.status === status) {
          throw new MockApiError("ORDER_STATUS_UNCHANGED", `Order ${code} is already ${status}.`, 409);
        }
        if (trackingCode !== undefined) order.trackingCode = trackingCode;
        if (status === "DELIVERED" && order.paymentStatus === "UNPAID") order.paymentStatus = "PAID";
        appendTimeline(order, status, note, actor);
        return cloneDeep(order);
      }),
  });

/** POST admin/orders/{code}/cancel */
export const cancelOrder = ({ code, reason, actor = DEFAULT_ACTOR }: CancelOrderPayload): Promise<Order> =>
  apiRequest({
    method: "POST",
    path: `admin/orders/${encodeURIComponent(code)}/cancel`,
    body: { reason },
    mock: () =>
      withLatency(() => {
        const order = requireOrder(code);
        if (["DELIVERED", "RETURNED", "REFUNDED", "CANCELLED"].includes(order.status)) {
          throw new MockApiError("ORDER_NOT_CANCELLABLE", `Order ${code} can no longer be cancelled from ${order.status}.`, 409);
        }
        appendTimeline(order, "CANCELLED", reason, actor);
        return cloneDeep(order);
      }),
  });

/** POST admin/orders/{code}/return */
export const returnOrder = ({ code, reason, lineIds, actor = DEFAULT_ACTOR }: ReturnOrderPayload): Promise<Order> =>
  apiRequest({
    method: "POST",
    path: `admin/orders/${encodeURIComponent(code)}/return`,
    body: { reason, lineIds },
    mock: () =>
      withLatency(() => {
        const order = requireOrder(code);
        if (order.status !== "DELIVERED" && order.status !== "RETURN_REQUESTED") {
          throw new MockApiError("ORDER_NOT_RETURNABLE", `Only delivered orders can be returned; ${code} is ${order.status}.`, 409);
        }
        const unknownLine = lineIds.find((lineId) => !order.lines.some((line) => line.id === lineId));
        if (unknownLine) {
          throw new MockApiError("ORDER_LINE_NOT_FOUND", `Order ${code} has no line ${unknownLine}.`, 404);
        }
        appendTimeline(order, "RETURNED", reason, actor);
        return cloneDeep(order);
      }),
  });

/** POST admin/orders/{code}/refund */
export const refundOrder = ({ code, amount, reason, actor = DEFAULT_ACTOR }: RefundOrderPayload): Promise<Order> =>
  apiRequest({
    method: "POST",
    path: `admin/orders/${encodeURIComponent(code)}/refund`,
    body: { amount, reason },
    mock: () =>
      withLatency(() => {
        const order = requireOrder(code);
        if (amount <= 0 || amount > order.totals.grandTotal) {
          throw new MockApiError("REFUND_AMOUNT_INVALID", `Refund must be between 1 and ${order.totals.grandTotal}.`, 422);
        }
        order.paymentStatus = amount === order.totals.grandTotal ? "REFUNDED" : "REFUND_PENDING";
        appendTimeline(order, amount === order.totals.grandTotal ? "REFUNDED" : "REFUND_PENDING", reason, actor);
        return cloneDeep(order);
      }),
  });
