import { describe, expect, it } from "vitest";
import { ATTRIBUTES, CATEGORIES, COLLECTIONS, PRODUCTS } from "./catalog.data";
import { CMS_PAGES } from "./cms.data";
import { ORDERS } from "./order.data";
import { PROMOTIONS, VOUCHERS } from "./promotion.data";
import { CUSTOMERS } from "./customer.data";
import { CURATED_SETS } from "./set.data";
import { STOCK_LEVELS } from "./inventory.data";
describe("fresh project data", () => {
  it("does not create business records before the operator authors them", () => {
    for (const collection of [
      ATTRIBUTES,
      CATEGORIES,
      COLLECTIONS,
      PRODUCTS,
      CMS_PAGES,
      ORDERS,
      PROMOTIONS,
      VOUCHERS,
      CUSTOMERS,
      CURATED_SETS,
      STOCK_LEVELS,
    ])
      expect(collection).toEqual([]);
  });
});
