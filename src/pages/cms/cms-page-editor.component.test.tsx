// @vitest-environment jsdom
import { act } from "react";
import { SnackbarProvider } from "@/hooks/snackbar-provider.component";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CmsPageEditor } from "./cms-page-editor.component";
import { newCmsPage } from "./cms-demo.constants";
import type { CmsDemoStatus, CmsDemoPage } from "@/apis/cms-demo/cms-demo.interface";

vi.mock("@/trading-ui/components/editor/rich-text-editor.component", () => ({ RichTextEditor: () => null }));

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});
const button = (label: string) => Array.from(container.querySelectorAll("button")).find((entry) => entry.textContent?.trim() === label);
const save = vi.fn(async (page: CmsDemoPage, status: CmsDemoStatus) => ({ ...page, status, revision: page.revision + 1 }));
describe("CMS source wizard", () => {
  it("starts on the Basic/SEO step without pages or pre-added blocks", async () => {
    const page = newCmsPage();
    await act(async () => root.render(<SnackbarProvider><CmsPageEditor initial={page} saving={false} message="" onSave={save} /></SnackbarProvider>));
    expect(page.blocks).toEqual([]);
    expect(container.textContent).toContain("Thông tin cơ bản");
    expect(container.textContent).toContain("Cài đặt SEO");
    expect(Array.from(container.querySelectorAll("input")).filter((entry) => entry.name === "name")[0]?.value).toBe("");
    expect(container.textContent).not.toContain("Nội dung trang");
  });
  it("saves Basic first, then lets the operator choose a blank block", async () => {
    const page: CmsDemoPage = {
      ...newCmsPage(),
      name: "Trang test",
      slug: "trang-test",
      revision: 1,
      seo: { title: "SEO test", description: "Description test" },
    };
    await act(async () => root.render(<SnackbarProvider><CmsPageEditor initial={page} saving={false} message="" onSave={save} /></SnackbarProvider>));
    await act(async () => button("Tiếp tục")?.click());
    expect(container.textContent).toContain("Loại khối");
    expect(container.textContent).toContain("Nội dung trang");
    const addBlock = Array.from(container.querySelectorAll("button")).find((entry) => entry.textContent?.includes("Thẻ thông tin"));
    await act(async () => addBlock?.click());
    expect(container.textContent).toContain("Thẻ thông tin #1");
    await act(async () => button("Tiếp tục")?.click());

    expect(container.textContent).not.toContain("Xác nhận xuất bản");
    expect(container.textContent).toContain("cần tối thiểu 1");
    await act(async () => button("Lưu")?.click());
  });
});
