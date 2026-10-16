
import { backendRequest } from '../backend-request';
import { CmsDemoStatus, type CmsDemoPage, type CmsDemoBlockType, type CmsDemoConfig } from '../cms-demo/cms-demo.interface';
export interface JavaCmsPage { id: number|string; name: string; slug: string; status: CmsDemoStatus; locale: string; isActive: boolean;
  displayStatus?:CmsDemoPage['displayStatus']; targetDevice?:CmsDemoPage['targetDevice']; scheduleStart?:string|null; scheduleEnd?:string|null;
  hasUnpublishedChanges?:boolean; versionId?:number;
  seo: CmsDemoPage['seo']; blocks: { id: number|string; type: CmsDemoBlockType; sortOrder: number; isVisible: boolean; config: CmsDemoConfig }[] }
function view(page: JavaCmsPage): CmsDemoPage {
  return { ...page, seo:page.seo??{title:'',description:''},id:String(page.id), revision: page.versionId??0, blocks: page.blocks.map(block => ({ ...block, id:String(block.id), blockTypeCode: block.type })) };
}
export async function javaCmsPage(id:string):Promise<CmsDemoPage> { return view(await backendRequest<JavaCmsPage>('admin/cms/pages/'+encodeURIComponent(id))); }
export async function javaCmsPages(): Promise<CmsDemoPage[]> {
  return (await backendRequest<JavaCmsPage[]>('admin/cms/pages')).map(view);
}
export async function javaSaveCmsPage(page: CmsDemoPage): Promise<CmsDemoPage> {
  if (page.status === 'ARCHIVED') throw new Error('Java chỉ hỗ trợ Nháp / Xuất bản. Dùng tắt hiển thị để ẩn trang.');
  const existing = /^[1-9]\d*$/.test(page.id);
  const body = { name: page.name, slug: page.slug, locale: page.locale, status: CmsDemoStatus.DRAFT,
    isActive: page.isActive, seo: page.seo, targetDevice:page.targetDevice,
    scheduleStart:page.scheduleStart,scheduleEnd:page.scheduleEnd,blocks: page.blocks.map(block => ({
      type: block.blockTypeCode, sortOrder: block.sortOrder, isVisible: block.isVisible, config: block.config })) };
  const saved=await backendRequest<JavaCmsPage>('admin/cms/pages' + (existing ? '/' + page.id : ''), existing ? 'PUT' : 'POST', body);
  if(page.status===CmsDemoStatus.PUBLISHED)
    return view(await backendRequest<JavaCmsPage>('admin/cms/pages/'+saved.id+'/publish','POST'));
  return view(saved);
}
