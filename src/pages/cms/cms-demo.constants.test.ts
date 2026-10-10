import { describe, expect, it } from "vitest";
import { CmsDemoBlockType } from "@/apis/cms-demo/cms-demo.interface";
import { moveCmsBlock, newCmsBlock, newCmsPage } from "./cms-demo.constants";

describe("CMS editor", () => {
  it("creates draft pages and supported blocks without layout authoring", () => {
    expect(newCmsPage().status).toBe("DRAFT");
    for (const type of Object.values(CmsDemoBlockType)) {
      expect(newCmsBlock(type, 1)).toMatchObject({ blockTypeCode: type, isVisible: true, sortOrder: 1 });
    }
  });
  it("reorders blocks without changing the input and normalizes positions", () => {
    const blocks = [newCmsBlock(CmsDemoBlockType.INFO_CARDS, 1), newCmsBlock(CmsDemoBlockType.IMAGE_GALLERY, 2)];
    expect(moveCmsBlock(blocks, 1, -1).map((block) => block.id)).toEqual([blocks[1].id, blocks[0].id]);
    expect(blocks[0].sortOrder).toBe(1);
    expect(moveCmsBlock(blocks, 0, -1)).toBe(blocks);
  });
});
