
import { useCallback,useEffect,useState } from 'react';
import { useForm,type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { productApi,ProductSpuStatus,type ProductCreateRequestDto,type ProductSkuMatrixLeafRowDto } from '@/trading-ui/apis/pim';
import { emptyProductSpuCreateForm } from '../components/product-spu-form.defaults';
import { productCreateRequestDtoSchema } from '../product-spu.constant';
import { useProductCreateCatalog } from './use-product-create-catalog.hook';
import { parseNullableNumber } from '../utils/product-spu-pricing.utils';
import { useSnackbar,SnackbarType } from '@/trading-ui/hooks/use-snackbar.hook';
import { ROUTE_PATH } from '@/router/route.path';
import type { ProductFormSnapshot } from '@/trading-ui/apis/product/product-form.mapper';
function leafSku(row:ProductSkuMatrixLeafRowDto) {
  return {uuid:row.variationUuid,skuCode:row.skuCode.trim(),status:row.status,attributeValueUuids:[...row.attributeValueUuids],medias:row.medias??[],
    sellingPriceAfterTaxMinor:parseNullableNumber(row.sellingPriceAfterTaxMinor)??undefined,
    compareAtPriceAfterTaxMinor:parseNullableNumber(row.compareAtPriceAfterTaxMinor),costPriceAfterTaxMinor:parseNullableNumber(row.costPriceAfterTaxMinor),
    taxRateOverride:parseNullableNumber(row.taxRateOverride),b2bWholesalePriceAfterTax:parseNullableNumber(row.b2bWholesalePriceAfterTax)??undefined,
    weight:parseNullableNumber(row.weight)??undefined,length:parseNullableNumber(row.length)??undefined,
    width:parseNullableNumber(row.width)??undefined,height:parseNullableNumber(row.height)??undefined};
}
function usePersistProduct(initial:ProductFormSnapshot|undefined) {
  const navigate=useNavigate(),{showSnackbar}=useSnackbar();
  const [saving,setSaving]=useState(false),[draftId,setDraftId]=useState<string|undefined>(initial?.id);
  const persist=useCallback(async(values:ProductCreateRequestDto,publish:boolean)=>{
    if(saving) return;
    setSaving(true);
    try {
      const draft=draftId?await productApi.putAdminProduct(draftId,values):await productApi.postAdminProduct(values);
      setDraftId(draft.id);
      if(publish) await productApi.patchAdminProductStatus(draft.id,ProductSpuStatus.PUBLISHED);
      showSnackbar({message:publish?'Đã xuất bản sản phẩm.':'Đã lưu nháp sản phẩm.',type:SnackbarType.SUCCESS});
      navigate(ROUTE_PATH.PRODUCT_LIST);
    } catch(error) {showSnackbar({message:error instanceof Error?error.message:'Không thể lưu sản phẩm.',type:SnackbarType.ERROR});}
    finally {setSaving(false);}
  },[draftId,navigate,saving,showSnackbar]);
  return {saving,persist};
}
export function useProductCreateForm(initial?:ProductFormSnapshot,readOnly=false) {
  const form=useForm<ProductCreateRequestDto>({resolver:yupResolver(productCreateRequestDtoSchema) as unknown as Resolver<ProductCreateRequestDto>,
    defaultValues:initial?.values??emptyProductSpuCreateForm()});
  const catalog=useProductCreateCatalog(form.control,initial);
  const persistence=usePersistProduct(initial);
  const {setValue,clearErrors,getValues}=form;
  useEffect(()=>{setValue('attributes',catalog.assignments);if(catalog.assignments.length) clearErrors('attributes');},[catalog.assignments,setValue,clearErrors]);
  const setSkus=useCallback((rows:readonly ProductSkuMatrixLeafRowDto[])=>{
    const skus=rows.map(leafSku),previous=getValues('skus')??[];
    const defaultCode=getValues('defaultSkuCode');
    const previousDefault=previous.find(sku=>sku.skuCode===defaultCode);
    const defaultId=previousDefault && 'uuid' in previousDefault && typeof previousDefault.uuid==='string'
      ?previousDefault.uuid:undefined;
    const renamed=defaultId?skus.find(sku=>sku.uuid===defaultId):undefined;
    if(renamed) setValue('defaultSkuCode',renamed.skuCode);
    setValue('skus',skus);
  },[getValues,setValue]);
  return {form,catalog,setSkus,readOnly,isUpdate:Boolean(initial),...persistence};
}
