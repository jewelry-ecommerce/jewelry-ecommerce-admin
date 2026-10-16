
import { useEffect,useRef,useState } from 'react';
import useSWR from 'swr';
import { javaCmsPage } from '@/apis/java/java-cms.api';
import type { CmsDemoPage } from '@/apis/cms-demo/cms-demo.interface';
import type { CmsPageFormValues,CmsPageWizardBlock,CmsPageWizardMode } from '../cms-page.interface';
import { JAVA_CMS_BLOCK_CATALOG } from './java-cms-catalog';
import { TargetDevice } from '@/trading-ui/apis/cms/cms.enum';
export interface JavaCmsDraftParams {mode:CmsPageWizardMode;pageId?:string;onHydrateForm?:(values:CmsPageFormValues)=>void}
export function formValues(page:CmsDemoPage):CmsPageFormValues{return {name:page.name,slug:page.slug,locale:page.locale??'vi-VN',isActive:page.isActive!==false,
  seoTitle:page.seo.title??'',seoDescription:page.seo.description??'',seoKeywords:page.seo.keywords??'',canonicalUrl:page.seo.canonicalUrl??'',seoImageUrl:page.seo.imageUrl??''};}
export function useJavaCmsDraft(params:JavaCmsDraftParams){
  const draftRef=useRef<CmsDemoPage|null>(null),hydrateRef=useRef(params.onHydrateForm);
  const [blocks,setBlocks]=useState<CmsPageWizardBlock[]>([]);
  const [pageId,setPageId]=useState<string|null>(params.pageId??null);
  const [displaySettings,setDisplaySettings]=useState({targetDevice:TargetDevice.ALL,scheduleStart:null as string|null,scheduleEnd:null as string|null});
  const dataSwr=useSWR(params.pageId?['source-java-cms',params.pageId]:null,()=>javaCmsPage(params.pageId!),{revalidateOnFocus:false,revalidateOnMount:true});
  useEffect(()=>{
    const page=dataSwr.data;
    if(!page || draftRef.current?.id===page.id)return;
    draftRef.current=page;setPageId(page.id);hydrateRef.current?.(formValues(page));
    setDisplaySettings({targetDevice:Object.values(TargetDevice).find(device=>device===page.targetDevice)??TargetDevice.ALL,
      scheduleStart:page.scheduleStart??null,scheduleEnd:page.scheduleEnd??null});
    setBlocks(page.blocks.map(block=>{
      const entry=JAVA_CMS_BLOCK_CATALOG.find(entry=>entry.code===block.blockTypeCode);
      return {clientId:String(block.id),serverId:String(block.id),blockTypeCode:block.blockTypeCode,title:entry?.name??block.blockTypeCode,
        description:entry?.description??'',isActive:block.isVisible,config:block.config,schemaDefinition:entry?.schemaDefinition};
    }));
  },[dataSwr.data]);
  useEffect(()=>{hydrateRef.current=params.onHydrateForm;},[params.onHydrateForm]);
  return {draftRef,blocks,setBlocks,pageId,setPageId,displaySettings,setDisplaySettings,error:dataSwr.error};
}
