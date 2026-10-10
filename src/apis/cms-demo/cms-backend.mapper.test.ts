
import { describe, expect, it } from "vitest";
import { pageWrite } from "./cms-backend.mapper";
import { CmsDemoBlockType, CmsDemoStatus, type CmsDemoPage } from "./cms-demo.interface";
function page(id: string): CmsDemoPage {
  return { id, name: "Test page", slug: "test-page", status: CmsDemoStatus.DRAFT, revision: 2,
    seo: { title: "", description: "" }, blocks: [
      { id: "new-block", blockTypeCode: CmsDemoBlockType.INFO_CARDS, sortOrder: 0, isVisible: true, config: {} },
      { id: "42", blockTypeCode: CmsDemoBlockType.BANNER, sortOrder: 1, isVisible: true, config: { placementCode: "TEST" } },
    ] };
}
describe("CMS backend ID boundary", () => {
  it("omits temporary UI IDs on creation", () => {
    const input = pageWrite(page("temporary-page"));
    expect(input).not.toHaveProperty("revision");
    expect(input.blocks[0].id).toBeUndefined();
    expect(input.blocks[1].id).toBe(42);
  });
  it("sends revision when updating a numeric entity", () => {
    expect(pageWrite(page("12")).revision).toBe(2);
  });
});
