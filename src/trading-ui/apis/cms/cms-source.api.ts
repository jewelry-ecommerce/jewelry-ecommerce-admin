

import { javaCmsPage, javaCmsPages, javaSaveCmsPage } from '@/apis/java/java-cms.api';
import { backendRequest } from '@/apis/backend-request';
import type { CmsDemoPage } from '@/apis/cms-demo/cms-demo.interface';
import type { Page } from './cms.entities';
import type { ResList } from '../../common/constant/api.interface';
import type { CreatePageDto, UpdatePageDto, QueryPageDto } from './cms.interface';
import { PageDisplayStatus } from './cms.enum';
import { CmsDemoStatus } from '@/apis/cms-demo/cms-demo.interface';
export function sourcePage(page:CmsDemoPage):Page{
  return {id:page.id,name:page.name,slug:page.slug,locale:page.locale??'vi-VN',isActive:page.isActive!==false,
    seoTitle:page.seo?.title??undefined,seoDescription:page.seo?.description??undefined,seoKeywords:page.seo?.keywords??undefined,
    canonicalUrl:page.seo?.canonicalUrl??undefined,seoImageUrl:page.seo?.imageUrl??undefined,
    displayStatus:Object.values(PageDisplayStatus).find(status=>status===page.displayStatus)??(page.status===CmsDemoStatus.PUBLISHED?(page.isActive===false?PageDisplayStatus.PAUSED:PageDisplayStatus.RUNNING):PageDisplayStatus.DRAFT)};
}
export async function getPageList(query:QueryPageDto):Promise<ResList<Page>>{
  const search=query.search?.trim().toLowerCase();
  const pages=(await javaCmsPages()).map(sourcePage).filter(page=>(!search||page.name.toLowerCase().includes(search)||page.slug.includes(search))&&(!query.displayStatus||page.displayStatus===query.displayStatus));
  const page=query.page??1,take=query.take??20;
  return {list:query.isPagination===false?pages:pages.slice((page-1)*take,page*take),total:pages.length};
}
export async function getPageDetail(id:string):Promise<Page>{return sourcePage(await javaCmsPage(id));}
function metadata(body:CreatePageDto|UpdatePageDto){return {title:body.seoTitle??"",description:body.seoDescription??"",keywords:body.seoKeywords,canonicalUrl:body.canonicalUrl,imageUrl:body.seoImageUrl};}
export async function postPage(body:CreatePageDto):Promise<Page>{
  return sourcePage(await javaSaveCmsPage({id:'new',name:body.name,slug:body.slug,locale:body.locale,status:CmsDemoStatus.DRAFT,revision:0,isActive:body.isActive,seo:metadata(body),blocks:[]}));
}
export async function patchPage(id:string,body:UpdatePageDto):Promise<Page>{
  const current=await javaCmsPage(id);
  const supplied=Object.fromEntries(Object.entries(metadata(body)).filter(([key])=>{
    const fields={title:'seoTitle',description:'seoDescription',keywords:'seoKeywords',canonicalUrl:'canonicalUrl',imageUrl:'seoImageUrl'} as const;
    return Object.hasOwn(body,fields[key as keyof typeof fields]);
  }));
  return sourcePage(await javaSaveCmsPage({...current,...body,status:CmsDemoStatus.DRAFT,seo:{...current.seo,...supplied}}));
}
export async function deletePage(id:string):Promise<void>{await backendRequest<void>('admin/cms/pages/'+encodeURIComponent(id),'DELETE');}
