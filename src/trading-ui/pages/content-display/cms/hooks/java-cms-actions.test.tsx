// @vitest-environment jsdom
import { act, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { CmsDemoStatus, type CmsDemoPage } from '@/apis/cms-demo/cms-demo.interface';
import type { CmsPageFormValues, CmsPageWizardBlock } from '../cms-page.interface';
import { useJavaCmsActions } from './java-cms-actions';
const effects = vi.hoisted(() => ({ save: vi.fn(), navigate: vi.fn(), mutate: vi.fn(), snackbar: vi.fn() }));
vi.mock('@/apis/java/java-cms.api', () => ({ javaSaveCmsPage: effects.save }));
vi.mock('react-router-dom', () => ({ useNavigate: () => effects.navigate }));
vi.mock('swr', () => ({ useSWRConfig: () => ({ mutate: effects.mutate }) }));
vi.mock('@/hooks/use-snackbar.hook', () => ({ SnackbarType: { SUCCESS: 'success', ERROR: 'error' },
  useSnackbar: () => ({ showSnackbar: effects.snackbar }) }));

test('publish persists PUBLISHED and navigates to the CMS list only after success', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  effects.save.mockReset().mockResolvedValue({ id: '27', status: CmsDemoStatus.PUBLISHED });
  effects.navigate.mockReset();
  let actions: ReturnType<typeof useJavaCmsActions> | undefined;
  function Harness() {
    const form = useForm<CmsPageFormValues>({ defaultValues: { name: 'Page', slug: 'page',
      locale: 'vi-VN', isActive: true, seoTitle: 'Page', seoDescription: 'Description', seoKeywords: 'page' } });
    const draftRef = useRef<CmsDemoPage | null>(null);
    const [blocks, setBlocks] = useState<CmsPageWizardBlock[]>([]);
    const [pageId, setPageId] = useState<string | null>(null);
    actions = useJavaCmsActions({ draft: { draftRef, blocks, setBlocks, pageId, setPageId, error: undefined },
      handleSubmit: form.handleSubmit, setActiveStep: vi.fn() });
    return null;
  }
  const host = document.createElement('div');
  const root = createRoot(host);
  try {
    await act(async () => { root.render(<Harness />); });
    if (!actions) throw new Error('CMS actions did not initialize');
    await act(async () => { await actions?.onPublish(); });
    expect(effects.save).toHaveBeenCalledWith(expect.objectContaining({ status: CmsDemoStatus.PUBLISHED }));
    expect(effects.navigate).toHaveBeenCalledWith('/cms/pages');
    effects.save.mockRejectedValueOnce(new Error('Backend failed'));
    effects.navigate.mockClear();
    await act(async () => { await actions?.onPublish(); });
    expect(effects.navigate).not.toHaveBeenCalled();
    expect(effects.snackbar).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'error', message: 'Backend failed' }));
  } finally { await act(async () => { root.unmount(); }); vi.unstubAllGlobals(); }
});
