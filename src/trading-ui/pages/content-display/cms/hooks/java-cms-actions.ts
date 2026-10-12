
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import type { UseFormHandleSubmit } from 'react-hook-form';
import { javaSaveCmsPage } from '@/apis/java/java-cms.api';
import { CmsDemoBlockType,CmsDemoStatus } from '@/apis/cms-demo/cms-demo.interface';
import { ROUTE_PATH } from '@/router/route.path';
import { SnackbarType,useSnackbar } from '@/hooks/use-snackbar.hook';
import type { CmsPageFormValues } from '../cms-page.interface';
import type { useJavaCmsDraft } from './java-cms-draft';
import { validateBlockConfigBySchema } from '../utils/cms-block-schema.utils';
import { validateImageGalleryBlockConfig } from '../utils/cms-image-gallery-block.utils';
import type { CmsPageBlockValidationState } from '../cms-page.interface';
import { validateProductCarouselBlockConfig, sanitizeProductCarouselBlockConfig } from '../utils/cms-product-carousel-block.utils';
type Draft=ReturnType<typeof useJavaCmsDraft>;
interface Params {draft:Draft;handleSubmit:UseFormHandleSubmit<CmsPageFormValues>;setActiveStep:(step:number)=>void}
function blockType(code:string):CmsDemoBlockType{const type=Object.values(CmsDemoBlockType).find(type=>type===code);if(!type)throw new Error('Loại block không hỗ trợ.');return type;}
function validateBlocks(draft:Draft):CmsPageBlockValidationState{
  return Object.fromEntries(draft.blocks.filter(block=>block.isActive).map(block=>[block.clientId,{
    ...validateBlockConfigBySchema(block.schemaDefinition,block.config),
    ...(block.blockTypeCode===CmsDemoBlockType.PRODUCT_CAROUSEL?validateProductCarouselBlockConfig(block.config):{}),
    ...(block.blockTypeCode===CmsDemoBlockType.IMAGE_GALLERY?validateImageGalleryBlockConfig(block.config):{})
  }]).filter(([,errors])=>Object.keys(errors).length>0));
}
async function persist(values:CmsPageFormValues,draft:Draft,status:CmsDemoStatus){
  const saved=await javaSaveCmsPage({id:draft.draftRef.current?.id??'new',revision:0,status,name:values.name.trim(),slug:values.slug.trim(),locale:values.locale,isActive:values.isActive,
    seo:{title:values.seoTitle??"",description:values.seoDescription??"",keywords:values.seoKeywords,canonicalUrl:values.canonicalUrl,imageUrl:values.seoImageUrl},
    blocks:draft.blocks.map((block,index)=>({id:block.serverId??block.clientId,blockTypeCode:blockType(block.blockTypeCode),sortOrder:index+1,isVisible:block.isActive,
      config:block.blockTypeCode===CmsDemoBlockType.PRODUCT_CAROUSEL?sanitizeProductCarouselBlockConfig(block.config):block.config}))});
  draft.draftRef.current=saved;draft.setPageId(saved.id);return saved;
}
export function useJavaCmsActions({draft,handleSubmit,setActiveStep}:Params){
  const [blockValidationErrors,setBlockValidationErrors]=useState<CmsPageBlockValidationState>({});
  const [loading,setLoading]=useState(false),navigate=useNavigate(),{mutate}=useSWRConfig(),{showSnackbar}=useSnackbar();
  const submit=(nextStep:number|null,status?:CmsDemoStatus)=>handleSubmit(async values=>{
    if(loading)return;
    const errors=nextStep===1?{}:validateBlocks(draft);setBlockValidationErrors(errors);
    if(Object.keys(errors).length){setActiveStep(1);showSnackbar({type:SnackbarType.ERROR,message:"Kiểm tra lại cấu hình khối nội dung."});return;}
    setLoading(true);
    try{
      await persist(values,draft,status??draft.draftRef.current?.status??CmsDemoStatus.DRAFT);
      await mutate(key=>Array.isArray(key)&&key[0]==='cms/admin/pages');
      showSnackbar({type:SnackbarType.SUCCESS,message:status===CmsDemoStatus.PUBLISHED?'Xuất bản trang thành công.':'Lưu trang thành công.'});
      if(nextStep===null)navigate(ROUTE_PATH.CMS_PAGE_LIST);else setActiveStep(nextStep);
    }catch(error){showSnackbar({type:SnackbarType.ERROR,message:error instanceof Error?error.message:'Không thể lưu trang.'});}
    finally{setLoading(false);}
  });
  return {loading,blockValidationErrors,onContinueStep0:submit(1),onContinueStep2:submit(2),onSaveStep0:submit(null),onSaveStep2:submit(null),onSaveDraft:submit(null,CmsDemoStatus.DRAFT),onPublish:submit(null,CmsDemoStatus.PUBLISHED)};
}
