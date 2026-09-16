import type { Order, OrderLine, OrderStatus, OrderTimelineEntry } from "@/apis/order/order.interface";
import { findProductById, findVariantById } from "./catalog.data";
import { CUSTOMERS } from "./customer.data";

/**
 * Order fixtures covering the happy path and every exception state so the admin OMS tabs and the
 * customer order history both have realistic content. Order codes are shared with the admin app.
 */
type LineSpec = {
  variantId: string;
  quantity: number;
  setId?: string;
  setName?: string;
  setLineId?: string;
  setItemId?: string;
};

const buildLine = (spec: LineSpec, index: number): OrderLine => {
  const variant = findVariantById(spec.variantId);
  if (!variant) throw new Error(`Order fixture references an unknown variant: ${spec.variantId}`);
  const product = findProductById(variant.productId);
  if (!product) throw new Error(`Order fixture references an unknown product: ${variant.productId}`);

  const unitPrice = variant.salePrice;
  const lineDiscount = variant.listPrice > variant.salePrice ? (variant.listPrice - variant.salePrice) * spec.quantity : 0;

  return {
    id: `oln-${spec.variantId}-${index}`,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    variantId: variant.id,
    skuCode: variant.skuCode,
    variantLabel: [variant.metalColorLabel, variant.sizeLabel].filter(Boolean).join(" · "),
    image: variant.media[0]?.url ?? product.media[0]?.url ?? "",
    unitPrice,
    quantity: spec.quantity,
    lineDiscount,
    lineTotal: unitPrice * spec.quantity,
    setId: spec.setId ?? null,
    setName: spec.setName ?? null,
    setLineId: spec.setLineId ?? null,
    setItemId: spec.setItemId ?? null,
  };
};

const STATUS_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "PACKED", "SHIPPING", "DELIVERED"];

const buildTimeline = (status: OrderStatus, placedAt: string): OrderTimelineEntry[] => {
  const placedTime = new Date(placedAt).getTime();
  const step = (index: number) => new Date(placedTime + index * 8 * 60 * 60 * 1000).toISOString();

  const flowIndex = STATUS_FLOW.indexOf(status);
  const reached = flowIndex >= 0 ? STATUS_FLOW.slice(0, flowIndex + 1) : STATUS_FLOW.slice(0, 2);

  const entries: OrderTimelineEntry[] = reached.map((entryStatus, index) => ({
    id: `tl-${entryStatus}-${index}`,
    status: entryStatus,
    occurredAt: step(index),
    note: TIMELINE_NOTES[entryStatus],
    actor: index === 0 ? "Customer" : "Fulfilment team",
  }));

  if (flowIndex < 0) {
    entries.push({
      id: `tl-${status}-exception`,
      status,
      occurredAt: step(reached.length),
      note: TIMELINE_NOTES[status],
      actor: status === "CANCELLED" ? "Customer" : "Operations",
    });
  }

  return entries;
};

const TIMELINE_NOTES: Record<OrderStatus, string> = {
  PENDING: "Order placed, awaiting confirmation.",
  CONFIRMED: "Payment verified and stock reserved.",
  PREPARING: "Pieces being prepared and quality checked.",
  PACKED: "Packed into the presentation box, ready for pickup.",
  SHIPPING: "Handed to the courier.",
  DELIVERED: "Delivered and signed for.",
  CANCELLED: "Cancelled before fulfilment; reserved stock released.",
  DELIVERY_FAILED: "Courier could not deliver; redelivery scheduled.",
  RETURN_REQUESTED: "Customer requested a return.",
  RETURNED: "Returned pieces received and inspected.",
  REFUND_PENDING: "Refund submitted to the payment provider.",
  REFUNDED: "Refund completed.",
};

type OrderSpec = {
  code: string;
  status: OrderStatus;
  customerId: string | null;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  placedAt: string;
  lines: LineSpec[];
  paymentMethod: Order["paymentMethod"];
  paymentStatus: Order["paymentStatus"];
  shippingMethod: Order["shippingMethod"];
  voucherCode?: string;
  voucherDiscount?: number;
  loyaltyPointsUsed?: number;
  isPreOrder?: boolean;
  trackingCode?: string;
  note?: string;
  channel?: Order["channel"];
};

const ORDER_SPECS: OrderSpec[] = [
  {
    code: "ORD-2026-0841",
    status: "DELIVERED",
    customerId: "cus-demo-linh",
    placedAt: "2026-08-24T03:15:00.000Z",
    lines: [{ variantId: "prd-solitaire-halo-v1", quantity: 1 }],
    paymentMethod: "CREDIT_CARD",
    paymentStatus: "PAID",
    shippingMethod: "EXPRESS",
    voucherCode: "GOLD500",
    voucherDiscount: 500000,
    loyaltyPointsUsed: 200,
    trackingCode: "AUR-EXP-884213",
    note: "Please include a gift message card.",
  },
  {
    code: "ORD-2026-0908",
    status: "SHIPPING",
    customerId: "cus-demo-linh",
    placedAt: "2026-09-04T02:40:00.000Z",
    lines: [
      {
        variantId: "prd-charm-bracelet-v1",
        quantity: 1,
        setId: "set-charm-starter",
        setName: "Charm Starter Set",
        setLineId: "cln-charm-001",
        setItemId: "sti-charm-base",
      },
      {
        variantId: "prd-charm-clover-v1",
        quantity: 1,
        setId: "set-charm-starter",
        setName: "Charm Starter Set",
        setLineId: "cln-charm-001",
        setItemId: "sti-charm-first",
      },
      {
        variantId: "prd-charm-pinecone-v1",
        quantity: 1,
        setId: "set-charm-starter",
        setName: "Charm Starter Set",
        setLineId: "cln-charm-001",
        setItemId: "sti-charm-second",
      },
      {
        variantId: "prd-charm-feather-v1",
        quantity: 1,
        setId: "set-charm-starter",
        setName: "Charm Starter Set",
        setLineId: "cln-charm-001",
        setItemId: "sti-charm-third",
      },
    ],
    paymentMethod: "E_WALLET",
    paymentStatus: "PAID",
    shippingMethod: "STANDARD",
    trackingCode: "AUR-STD-990117",
  },
  {
    code: "ORD-2026-0912",
    status: "PENDING",
    customerId: "cus-demo-linh",
    placedAt: "2026-09-08T01:10:00.000Z",
    lines: [{ variantId: "prd-luminous-studs-v1", quantity: 1 }],
    paymentMethod: "BANK_TRANSFER",
    paymentStatus: "UNPAID",
    shippingMethod: "STANDARD",
    voucherCode: "WELCOME10",
    voucherDiscount: 2560000,
  },
  {
    code: "ORD-2026-0899",
    status: "PREPARING",
    customerId: "cus-minh-tran",
    placedAt: "2026-09-02T06:25:00.000Z",
    lines: [{ variantId: "prd-sapphire-tennis-v1", quantity: 1 }],
    paymentMethod: "BANK_TRANSFER",
    paymentStatus: "PAID",
    shippingMethod: "BOUTIQUE_PICKUP",
    note: "Customer will collect from the District 1 salon.",
  },
  {
    code: "ORD-2026-0877",
    status: "CANCELLED",
    customerId: "cus-hoa-pham",
    placedAt: "2026-08-29T08:00:00.000Z",
    lines: [{ variantId: "prd-mini-hoops-v1", quantity: 2 }],
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    shippingMethod: "STANDARD",
    note: "Cancelled at the customer's request.",
  },
  {
    code: "ORD-2026-0860",
    status: "RETURN_REQUESTED",
    customerId: "cus-minh-tran",
    placedAt: "2026-08-26T04:45:00.000Z",
    lines: [{ variantId: "prd-heirloom-signet-v1", quantity: 1 }],
    paymentMethod: "CREDIT_CARD",
    paymentStatus: "PAID",
    shippingMethod: "EXPRESS",
    trackingCode: "AUR-EXP-861002",
    note: "Requested a size exchange.",
  },
  {
    code: "ORD-2026-0845",
    status: "REFUNDED",
    customerId: "cus-hoa-pham",
    placedAt: "2026-08-20T07:30:00.000Z",
    lines: [{ variantId: "prd-pearl-threaders-v1", quantity: 1 }],
    paymentMethod: "E_WALLET",
    paymentStatus: "REFUNDED",
    shippingMethod: "STANDARD",
  },
  {
    code: "ORD-2026-0917",
    status: "CONFIRMED",
    customerId: null,
    guestName: "Guest Buyer",
    guestEmail: "guest.buyer@example.test",
    guestPhone: "0944556677",
    placedAt: "2026-09-08T09:05:00.000Z",
    lines: [{ variantId: "prd-charm-initial-v1", quantity: 1 }],
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    shippingMethod: "STANDARD",
  },
  {
    code: "ORD-2026-0920",
    status: "CONFIRMED",
    customerId: "cus-an-le",
    placedAt: "2026-09-09T02:00:00.000Z",
    lines: [{ variantId: "prd-aurora-trilogy-v1", quantity: 1 }],
    paymentMethod: "BANK_TRANSFER",
    paymentStatus: "DEPOSIT_PAID",
    shippingMethod: "BOUTIQUE_PICKUP",
    isPreOrder: true,
    note: "Pre-order — 30% deposit received.",
  },
  {
    code: "ORD-2026-0834",
    status: "DELIVERY_FAILED",
    customerId: "cus-an-le",
    placedAt: "2026-08-18T05:15:00.000Z",
    lines: [{ variantId: "prd-charm-feather-v1", quantity: 1 }],
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    shippingMethod: "STANDARD",
    trackingCode: "AUR-STD-834550",
    note: "Recipient unavailable; redelivery arranged.",
  },
];

const SHIPPING_FEE_BY_METHOD: Record<Order["shippingMethod"], number> = {
  STANDARD: 45000,
  EXPRESS: 120000,
  BOUTIQUE_PICKUP: 0,
};

const buildOrder = (spec: OrderSpec): Order => {
  const customer = spec.customerId ? CUSTOMERS.find((entry) => entry.id === spec.customerId) : undefined;
  const lines = spec.lines.map(buildLine);
  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
  const productDiscount = lines.reduce((total, line) => total + line.lineDiscount, 0);
  const voucherDiscount = spec.voucherDiscount ?? 0;
  const loyaltyPointsUsed = spec.loyaltyPointsUsed ?? 0;
  const loyaltyDiscount = loyaltyPointsUsed * 1000;
  const shippingFee = SHIPPING_FEE_BY_METHOD[spec.shippingMethod];
  const grandTotal = Math.max(0, subtotal - voucherDiscount - loyaltyDiscount + shippingFee);

  const address = customer?.addresses[0] ?? {
    id: "adr-guest",
    fullName: spec.guestName ?? "Guest Buyer",
    phone: spec.guestPhone ?? "0900000000",
    line1: "45 Dong Khoi",
    ward: "Ben Nghe",
    district: "District 1",
    province: "Ho Chi Minh City",
    isDefault: true,
    label: "OTHER" as const,
  };

  return {
    id: `ord-${spec.code.toLowerCase()}`,
    code: spec.code,
    status: spec.status,
    channel: spec.channel ?? "ONLINE",
    customerId: spec.customerId,
    customerName: customer?.fullName ?? spec.guestName ?? "Guest Buyer",
    customerEmail: customer?.email ?? spec.guestEmail ?? "guest@example.test",
    customerPhone: customer?.phone ?? spec.guestPhone ?? "0900000000",
    isGuest: !spec.customerId,
    shippingAddress: address,
    shippingMethod: spec.shippingMethod,
    trackingCode: spec.trackingCode ?? null,
    paymentMethod: spec.paymentMethod,
    paymentStatus: spec.paymentStatus,
    appliedVoucherCode: spec.voucherCode ?? null,
    isPreOrder: spec.isPreOrder ?? false,
    expectedDeliveryAt: spec.isPreOrder ? "2026-11-15T09:00:00.000Z" : null,
    lines,
    totals: {
      subtotal,
      productDiscount,
      voucherDiscount,
      shippingFee,
      loyaltyPointsUsed,
      loyaltyDiscount,
      grandTotal,
      depositAmount: spec.isPreOrder ? Math.round(grandTotal * 0.3) : null,
    },
    timeline: buildTimeline(spec.status, spec.placedAt),
    note: spec.note ?? "",
    placedAt: spec.placedAt,
    updatedAt: spec.placedAt,
  };
};

export const ORDERS: Order[] = ORDER_SPECS.map(buildOrder);

export const findOrderByCode = (code: string): Order | undefined =>
  ORDERS.find((order) => order.code.toUpperCase() === code.trim().toUpperCase());

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  PACKED: "Packed",
  SHIPPING: "Shipping",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  DELIVERY_FAILED: "Delivery failed",
  RETURN_REQUESTED: "Return requested",
  RETURNED: "Returned",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
};
