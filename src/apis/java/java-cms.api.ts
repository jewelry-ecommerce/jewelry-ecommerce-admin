
import { backendRequest } from '../backend-request';
import type { CmsDemoPage, CmsDemoBlockType, CmsDemoStatus, CmsDemoConfig } from '../cms-demo/cms-demo.interface';
export interface JavaCmsPage { id: number; name: string; slug: string; status: CmsDemoStatus; locale: string; isActive: boolean;
  seo: CmsDemoPage['seo']; blocks: { id: number; type: CmsDemoBlockType; sortOrder: number; isVisible: boolean; config: CmsDemoConfig }[] }
function view(page: JavaCmsPage): CmsDemoPage {
  return { ...page, id:String(page.id), revision: 0, blocks: page.blocks.map(block => ({ ...block, id:String(block.id), blockTypeCode: block.type })) };
}
export async function javaCmsPage(id:string):Promise<CmsDemoPage> { return view(await backendRequest<JavaCmsPage>('admin/cms/pages/'+encodeURIComponent(id))); }
export async function javaCmsPages(): Promise<CmsDemoPage[]> {
  return (await backendRequest<JavaCmsPage[]>('admin/cms/pages')).map(view);
}
export async function javaSaveCmsPage(page: CmsDemoPage): Promise<CmsDemoPage> {
  if (page.status === 'ARCHIVED') throw new Error('Java chỉ hỗ trợ Nháp / Xuất bản. Dùng tắt hiển thị để ẩn trang.');
  const existing = /^[1-9]\d*$/.test(page.id);
  const body = { name: page.name, slug: page.slug, locale: page.locale, status: page.status,
    isActive: page.isActive, seo: page.seo, blocks: page.blocks.map(block => ({
      type: block.blockTypeCode, sortOrder: block.sortOrder, isVisible: block.isVisible, config: block.config })) };
  return view(await backendRequest<JavaCmsPage>('admin/cms/pages' + (existing ? '/' + page.id : ''), existing ? 'PUT' : 'POST', body));
}
