// @vitest-environment jsdom
import type * as AppConfigModule from "@/common/config/app.config";
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { SnackbarProvider } from '@/hooks/snackbar-provider.component';
import { CmsBlockFields } from './cms-block-fields.component';
import { newCmsBlock } from './cms-demo.constants';
import { CmsDemoBlockType } from '@/apis/cms-demo/cms-demo.interface';
import type * as CmsSourceApiModule from '@/trading-ui/apis';
vi.mock("@/common/config/app.config", async (importOriginal) => ({
  ...await importOriginal<typeof AppConfigModule>(),
  getDataSourceMode: () => "MOCK", isJavaBackend: () => false,
}));
vi.mock('@/trading-ui/components/editor/rich-text-editor.component', () => ({ RichTextEditor: () => null }));
vi.mock('@/trading-ui/apis', async (importOriginal) => ({
  ...await importOriginal<typeof CmsSourceApiModule>(),
  productApi: { getAdminProductList: async () => ({ list: [
    { id: 'test-product', spuCode: 'TEST-SKU', name: 'Sản phẩm kiểm thử', image: '/test-product.png', imageHover: '', variations: [] },
  ] }) },
}));
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
function Harness({ type }: { type: CmsDemoBlockType }) {
  const [block, setBlock] = useState(newCmsBlock(type, 1));
  return <MemoryRouter><SnackbarProvider><SWRConfig value={{ provider: () => new Map() }}>
    <CmsBlockFields block={block} disabled={false} onChange={config => setBlock(current => ({ ...current, config }))} />
    <output data-testid="config">{JSON.stringify(block.config)}</output>
  </SWRConfig></SnackbarProvider></MemoryRouter>;
}
async function clickText(label: string): Promise<void> {
  const button = [...document.querySelectorAll('button')].find(entry => entry.textContent?.trim() === label);
  expect(button).toBeDefined();
  await act(async () => button?.click());
}
describe('ported CMS source forms', () => {
  it('adds an empty info card with file upload, persists its uploaded image, and has no raw image URL field', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ asset: { publicUrl: '/api/demo-cms/media/test.png' } }) })));
    await act(async () => root.render(<Harness type={CmsDemoBlockType.INFO_CARDS} />));
    await clickText('Thêm thẻ');
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(fileInput?.accept).toContain('image/png');
    expect(container.querySelector('input[placeholder*="/images/"]')).toBeNull();
    expect(container.textContent).not.toContain('Xóa mục 1');
    Object.defineProperty(fileInput, 'files', { value: [new File(['png'], 'test.png', { type: 'image/png' })] });
    await act(async () => fileInput?.dispatchEvent(new Event('change', { bubbles: true })));
    expect(fetch).toHaveBeenCalledWith('/api/demo-cms/media', expect.objectContaining({ method: 'POST', body: expect.any(FormData) }));
    expect(container.querySelector('output')?.textContent).toContain('http://localhost:3100/api/demo-cms/media/test.png');
  });
  it('chooses products through the original dialog instead of a comma-separated ID field', async () => {
    await act(async () => root.render(<Harness type={CmsDemoBlockType.PRODUCT_CAROUSEL} />));
    expect(container.textContent).not.toContain('phân cách bằng dấu phẩy');
    await clickText('Thêm sản phẩm');
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Sản phẩm kiểm thử');
    const checkbox = document.querySelector<HTMLInputElement>('[role="dialog"] input[type="checkbox"]');
    await act(async () => checkbox?.click());
    await clickText('Áp dụng');
    expect(container.querySelector('output')?.textContent).toContain('"productIds":["test-product"]');
  });
});
