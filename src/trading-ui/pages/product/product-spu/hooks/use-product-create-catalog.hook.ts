
import { useMemo, useState } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import useSWR from 'swr';
import { attributeApi,categoryApi,productApi,type ProductCreateRequestDto } from '@/trading-ui/apis/pim';
import { CategoryStatus } from '@/trading-ui/apis/category/category.enum';
import { buildCategoryTreeSelectOptions,findCategoryInTree } from '../utils/product-spu-category-tree.utils';
import { buildAppliedSummariesOrdered,buildAttributeTreeSelectOptions,buildProductAttributeAssignmentsFromSelection,buildSkuMatrixPreviewRequestDto,getActiveAttributeIdsInTreeOrder,mergeOrderedAttributeIds } from '../utils/product-spu-attribute-tree.utils';
import { flattenSkuPreviewMatrixForTable,skuPreviewResponseToAttributeDefs } from '../utils/product-spu-sku-matrix-preview.utils';
import { parseNullableNumber } from '../utils/product-spu-pricing.utils';
import { hydrateProductMatrix,type ProductFormSnapshot } from '@/trading-ui/apis/product/product-form.mapper';
function useSelection(categoryId:string,initial:ProductFormSnapshot|undefined) {
  const [state,setState]=useState({categoryId,selected:initial?.selected??[] as readonly string[],order:initial?.values.attributes.map(attribute=>attribute.attributeUuid)??[] as string[]});
  if(state.categoryId!==categoryId) setState({categoryId,selected:[],order:[]});
  const selected=state.categoryId===categoryId?state.selected:[];
  const order=state.categoryId===categoryId?state.order:[];
  return {selected,order,setSelected:(selected:readonly string[])=>setState(previous=>({...previous,selected})),
    setOrder:(order:string[])=>setState(previous=>({...previous,order}))};
}
export function useProductCreateCatalog(control:Control<ProductCreateRequestDto>,initial?:ProductFormSnapshot) {
  const categoryId=useWatch({control,name:'categoryUuid'})??'';
  const selection=useSelection(categoryId,initial);
  const [selectOpen,setSelectOpen]=useState(false);
  const {data:categories}=useSWR('pim/category/tree',()=>categoryApi.getCategoryTree({status:CategoryStatus.ACTIVE}));
  const {data:attributes,isLoading:attributeLoading}=useSWR(categoryId?['pim/attributes/tree',categoryId]:null,
    ()=>attributeApi.getAttributeTree({categoryId}));
  const tree=useMemo(()=>attributes?.list??[],[attributes]);
  const order=useMemo(()=>mergeOrderedAttributeIds(selection.order,getActiveAttributeIdsInTreeOrder(tree,selection.selected)),[tree,selection.order,selection.selected]);
  const assignments=useMemo(()=>buildProductAttributeAssignmentsFromSelection(tree,selection.selected),[tree,selection.selected]);
  const preview=useMemo(()=>buildSkuMatrixPreviewRequestDto(order,assignments),[order,assignments]);
  const {data:matrix,isLoading:matrixLoading,error:matrixError}=useSWR(!selectOpen&&preview?['pim/sku/matrix',JSON.stringify(preview)]:null,
    ()=>{if(!preview) throw new Error('Chưa chọn thuộc tính.');return productApi.postSkuMatrixPreview(preview);},{revalidateOnFocus:false});
  const attributeOrder=useMemo(()=>matrix?skuPreviewResponseToAttributeDefs(matrix):[],[matrix]);
  const flatRows=useMemo(()=>matrix?flattenSkuPreviewMatrixForTable(hydrateProductMatrix(matrix,initial),
    {mediaUrlsByVariantId:new Map(initial?.skus.map(sku=>[sku.uuid??'',sku.medias]))}):undefined,[matrix,initial]);
  const category=findCategoryInTree(categories??[],categoryId);
  return {categoryOptions:buildCategoryTreeSelectOptions(categories??[]),categoryTaxRate:parseNullableNumber(category?.taxRate),
    categoryTaxRateText:category?.taxRate??'',assignments,attributeLoading,matrixLoading,matrixError,
    attributeOptions:buildAttributeTreeSelectOptions(tree),attributeOrder,flatRows,
    summaries:buildAppliedSummariesOrdered(tree,selection.selected,order),selected:selection.selected,
    setSelected:selection.setSelected,setOrder:selection.setOrder,setSelectOpen};
}
