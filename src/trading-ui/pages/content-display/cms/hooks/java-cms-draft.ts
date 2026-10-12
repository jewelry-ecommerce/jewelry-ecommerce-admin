
import { useEffect,useRef,useState } from 'react';
import useSWR from 'swr';
import { javaCmsPage } from '@/apis/java/java-cms.api';
import type { CmsDemoPage } from '@/apis/cms-demo/cms-demo.interface';
import type { CmsPageFormValues,CmsPageWizardBlock,CmsPageWizardMode } from '../cms-page.interface';
import { JAVA_CMS_BLOCK_CATALOG } from './java-cms-catalog';
export interface JavaCmsDraftParams {mode:CmsPageWizardMode;pageId?:string;onHydrateForm?:(values:CmsPageFormValues)=>void}
export function formValues(page:CmsDemoPage):CmsPageFormValues{return {name:page.name,slug:page.slug,locale:page.locale??'vi-VN',isActive:page.isActive!==false,
  seoTitle:page.seo.title??'',seoDescription:page.seo.description??'',seoKeywords:page.seo.keywords??'',canonicalUrl:page.seo.canonicalUrl??'',seoImageUrl:page.seo.imageUrl??''};}
export function useJavaCmsDraft(params:JavaCmsDraftParams){
  const draftRef=useRef<CmsDemoPage|null>(null),hydrateRef=useRef(params.onHydrateForm);
  const [blocks,setBlocks]=useState<CmsPageWizardBlock[]>([]);
  const [pageId,setPageId]=useState<string|null>(params.pageId??null);
  const dataSwr=useSWR(params.pageId?['source-java-cms',params.pageId]:null,()=>javaCmsPage(params.pageId!),{revalidateOnFocus:false,revalidateOnMount:true,onSuccess:page=>{
    draftRef.current=page;setPageId(page.id);hydrateRef.current?.(formValues(page));
    setBlocks(page.blocks.map(block=>{
      const entry=JAVA_CMS_BLOCK_CATALOG.find(entry=>entry.code===block.blockTypeCode);
      return {clientId:String(block.id),serverId:String(block.id),blockTypeCode:block.blockTypeCode,title:entry?.name??block.blockTypeCode,
        description:entry?.description??'',isActive:block.isVisible,config:block.config,schemaDefinition:entry?.schemaDefinition};
    }));
  }});
  useEffect(()=>{hydrateRef.current=params.onHydrateForm;},[params.onHydrateForm]);
  return {draftRef,blocks,setBlocks,pageId,setPageId,error:dataSwr.error};
}
