// @vitest-environment jsdom
import type * as AppConfigModule from "@/common/config/app.config";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SnackbarProvider } from "@/hooks/snackbar-provider.component";
import { CmsBlockFields } from "./cms-block-fields.component";
import { newCmsBlock } from "./cms-demo.constants";
import { CmsDemoBlockType } from "@/apis/cms-demo/cms-demo.interface";
vi.mock("@/common/config/app.config", async (importOriginal) => ({
  ...await importOriginal<typeof AppConfigModule>(),
  getDataSourceMode: () => "MOCK", isJavaBackend: () => false,
}));
vi.mock("@/trading-ui/components/editor/rich-text-editor.component", () => ({ RichTextEditor: () => null }));
const placement = { id: "placement-test", code: "TEST_HERO", name: "Banner test", displayType: "SLIDER", status: "ACTIVE" };
const initialBanner = {
  id: "banner-test",
  internalName: "Ảnh gốc",
  mediaType: "IMAGE",
  mediaUrl: "/old.png",
  mediaMobileUrl: "/old-mobile.png",
  layout: "CENTER",
  title: "Ban đầu",
  titleColor: "#FFFFFF",
  actionsLayout: "STACK",
  status: "ACTIVE",
  actions: [],
};
const initialLayout = {
  id: "layout-test",
  placementId: placement.id,
  name: "Layout test",
  revision: 1,
  status: "ACTIVE",
  items: [
    {
      id: "slot-test",
      slotKey: "1",
      bannerId: initialBanner.id,
      banner: initialBanner,
      displayMetadata: { x: 0, y: 0, width: 1, height: 1, order: 1 },
    },
  ],
};
let root: Root;
let container: HTMLDivElement;
let mediaCount: number;
const requests: { operation: string; data?: Record<string, unknown> }[] = [];
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  mediaCount = 0;
  requests.length = 0;
  Object.defineProperty(URL, "createObjectURL", { value: vi.fn(() => "blob:mock-media"), configurable: true });
  Object.defineProperty(URL, "revokeObjectURL", { value: vi.fn(), configurable: true });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      if (String(url).endsWith("/media"))
        return { ok: true, json: async () => ({ asset: { publicUrl: "/media/upload-" + ++mediaCount + ".png" } }) };
      const request: { operation: string; data?: Record<string, unknown> } = JSON.parse(String(init?.body));
      requests.push(request);
      const responses: Record<string, unknown> = {
        postPlacement: { ...placement, ...request.data },
        getPlacementList: { total: 1, list: [placement] },
        getPlacementLayoutList: [initialLayout],
        getPlacementLayoutDetail: initialLayout,
        patchBanner: { ...initialBanner, ...request.data },
        patchPlacementLayoutItem: initialLayout.items[0],
      };
      return { ok: true, json: async () => responses[request.operation] };
    }),
  );
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
function Harness({ code = "TEST_HERO" }: { code?: string }) {
  const [block, setBlock] = useState({ ...newCmsBlock(CmsDemoBlockType.BANNER, 1), config: { placementCode: code } });
  return (
    <SnackbarProvider>
      <SWRConfig value={{ provider: () => new Map() }}>
        <CmsBlockFields
          block={block}
          disabled={false}
          onChange={(config) => setBlock((current) => ({ ...current, config: { placementCode: config.placementCode || "" } }))}
        />
        <output>{JSON.stringify(block.config)}</output>
      </SWRConfig>
    </SnackbarProvider>
  );
}
async function click(label: string) {
  const button = [...document.querySelectorAll("button")].find((entry) => entry.textContent?.trim() === label);
  expect(button).toBeDefined();
  await act(async () => button?.click());
}
describe("source banner builder integration", () => {
  it("opens the original create form and creates a blank grid only after the operator submits it", async () => {
    await act(async () => root.render(<Harness code="" />));
    expect(requests.some((request) => request.operation === "postPlacement")).toBe(false);
    await click("Tạo nội dung banner");
    const inputs = [...document.querySelectorAll<HTMLInputElement>('[role="dialog"] input[type="text"]')];
    expect(inputs).toHaveLength(1);
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(inputs[0], "Banner mới từ UI");
      inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
    });
    await click("Tạo vị trí hiển thị");
    expect(requests.find((request) => request.operation === "postPlacement")?.data).toMatchObject({
      name: "Banner mới từ UI",
      displayType: "GRID",
    });
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Dựng lưới");
    expect(requests.some((request) => request.operation === "postBanner")).toBe(false);
  });
  it("opens the original editor, uploads desktop/mobile media, saves the edited slot and applies its code", async () => {
    await act(async () => root.render(<Harness />));
    await click("Chỉnh sửa nội dung banner");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Biên tập banner");
    const uploads = [...document.querySelectorAll<HTMLInputElement>('[role="dialog"] input[type="file"]')];
    expect(uploads).toHaveLength(2);
    for (const input of uploads) {
      Object.defineProperty(input, "files", { value: [new File(["png"], "test.png", { type: "image/png" })] });
      await act(async () => input.dispatchEvent(new Event("change", { bubbles: true })));
    }
    await click("Lưu và áp dụng mã vị trí");
    const update = requests.find((request) => request.operation === "patchBanner");
    expect(update?.data).toMatchObject({
      mediaUrl: "http://localhost:3100/media/upload-1.png",
      mediaMobileUrl: "http://localhost:3100/media/upload-2.png",
    });
    expect(requests.some((request) => request.operation === "patchPlacementLayoutItem")).toBe(true);
    expect(container.querySelector("output")?.textContent).toContain("TEST_HERO");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
