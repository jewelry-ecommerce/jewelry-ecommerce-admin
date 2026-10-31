
import { useState } from 'react';
import { PointerSensor,useSensor,useSensors,type DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { UseFormHandleSubmit } from 'react-hook-form';
import type { Page } from '@/trading-ui/apis/cms/cms.entities';
import { CmsDemoStatus } from '@/apis/cms-demo/cms-demo.interface';
import type { CmsPageFormValues,CmsPageWizardMode } from '../cms-page.interface';
import { JAVA_CMS_BLOCK_CATALOG,newWizardBlock } from './java-cms-catalog';
import { useJavaCmsDraft } from './java-cms-draft';
import { useJavaCmsActions } from './java-cms-actions';
import { createCmsBannerPlacement } from '@/pages/cms/cms-banner-placement.service';
export interface UseCmsPageWizardParams {mode:CmsPageWizardMode;pageId?:string;pageDetail?:Page;handleSubmit:UseFormHandleSubmit<CmsPageFormValues>;onHydrateForm?:(values:CmsPageFormValues)=>void}
export function useCmsPageWizard(params:UseCmsPageWizardParams){
  const draft=useJavaCmsDraft(params),[activeStep,setActiveStep]=useState(0),[previewOpen,setPreviewOpen]=useState(false),[createBlockTypeOpen,setCreateBlockTypeOpen]=useState(false);
  const actions=useJavaCmsActions({draft,handleSubmit:params.handleSubmit,setActiveStep});
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:6}}));
  const changeConfig=(clientId:string,config:Record<string,unknown>,merge=false)=>draft.setBlocks(blocks=>blocks.map(block=>block.clientId===clientId?{...block,config:merge?{...block.config,...config}:config}:block));
  const handleDragEnd=({active,over}:DragEndEvent)=>{if(!over||active.id===over.id)return;draft.setBlocks(blocks=>arrayMove(blocks,blocks.findIndex(block=>block.clientId===active.id),blocks.findIndex(block=>block.clientId===over.id)));};
  return {...draft,...actions,activeStep,setActiveStep,goToStep:setActiveStep,sensors,previewOpen,setPreviewOpen,createBlockTypeOpen,setCreateBlockTypeOpen,
    blockCatalog:JAVA_CMS_BLOCK_CATALOG,hasBlockTypes:true,targetDevice:draft.displaySettings.targetDevice,displaySettings:draft.displaySettings,setDisplaySettings:draft.setDisplaySettings,
    isPublishedVersion:draft.draftRef.current?.status===CmsDemoStatus.PUBLISHED,loadingSave:actions.loading,loadingContinue:actions.loading,loadingPublish:actions.loading,
    addBlock:(entry:Parameters<typeof newWizardBlock>[0])=>draft.setBlocks(blocks=>[...blocks,newWizardBlock(entry)]),
    setBlockConfig:(id:string,config:Record<string,unknown>)=>changeConfig(id,config),mergeBlockConfig:(id:string,config:Record<string,unknown>)=>changeConfig(id,config,true),
    toggleBlock:(id:string,isActive:boolean)=>draft.setBlocks(blocks=>blocks.map(block=>block.clientId===id?{...block,isActive}:block)),
    removeBlock:(id:string)=>draft.setBlocks(blocks=>blocks.filter(block=>block.clientId!==id)),handleDragEnd,
    createBannerPlacementDraft:createCmsBannerPlacement,createBlockType:async(_dto:unknown)=>{throw new Error('Vui lòng chọn loại khối nội dung có sẵn.');}};
}
