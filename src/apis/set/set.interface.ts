import type { ProductStatus, StockStatus } from "@/apis/product/product.interface";

/**
 * Curated set contract mirroring `jewelry-commerce-client/src/utils/api/set/set.interface.ts`.
 *
 * `setItemId` identifies the slot inside the set; `variantId` identifies the SKU chosen for it. The
 * pair must always travel together — the slot is never inferred from the SKU.
 */
export type CuratedSetItem = {
  setItemId: string;
  slotName: string;
  productId: string;
  /** SKUs the customer may pick for this slot. */
  selectableVariantIds: string[];
  defaultVariantId: string;
  isKeyPiece: boolean;
  sortOrder: number;
};

export type CuratedSet = {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  status: ProductStatus;
  heroImage: string;
  media: string[];
  items: CuratedSetItem[];
  /** Percentage saved versus buying each piece separately. */
  bundleDiscountPercent: number;
  stockStatus: StockStatus;
  createdAt: string;
};

export type CuratedSetSelection = {
  setItemId: string;
  variantId: string;
};

/* ------------------------------------------------------------------------------------------------
 * Admin-side contracts
 * ---------------------------------------------------------------------------------------------- */

export type CuratedSetRow = {
  id: string;
  code: string;
  name: string;
  slug: string;
  heroImage: string;
  status: ProductStatus;
  itemCount: number;
  keyPieceCount: number;
  bundleDiscountPercent: number;
  stockStatus: StockStatus;
  createdAt: string;
};

export type CuratedSetListQuery = {
  page?: number;
  take?: number;
  search?: string;
  status?: ProductStatus;
};

export type CuratedSetItemPayload = {
  slotName: string;
  productId: string;
  selectableVariantIds: string[];
  defaultVariantId: string;
  isKeyPiece: boolean;
  sortOrder: number;
};

export type CuratedSetPayload = {
  code: string;
  name: string;
  slug: string;
  description: string;
  status: ProductStatus;
  bundleDiscountPercent: number;
  items: CuratedSetItemPayload[];
};
