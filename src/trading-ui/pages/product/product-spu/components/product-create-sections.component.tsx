
import { Stack,Typography,Alert } from '@mui/material';
import { useWatch } from 'react-hook-form';
import { Archive,FolderSearch,InfoCircle } from '@untitledui/icons';
import { ProductSpuSectionPanel } from './product-spu-page-sections.component';
import { ProductSpuForm,ProductSpuSeoFormFields } from './product-spu-form.component';
import { ProductSpuVariantMatrix } from './product-spu-variant-matrix.component';
import { TYPOGRAPHY_STYLES } from '@/trading-ui/common/constant/typography.constant';
import type { useProductCreateForm } from '../hooks/use-product-create-form.hook';
import { mapRhfSkuRowErrorsToLeafFieldErrors } from '../utils/product-spu-sku-field-errors.utils';
import type { VariantKeyRow } from '../product-spu.interface';
const EMPTY_VARIANT_KEYS:readonly VariantKeyRow[]=[];
export type ProductCreateModel=ReturnType<typeof useProductCreateForm>;
export function ProductCreateGeneral({model}:{model:ProductCreateModel}) {
  return <ProductSpuSectionPanel title="Thông tin chung" icon={<InfoCircle size={20} color="#737373"/>}>
    <ProductSpuForm control={model.form.control} categoryTreeOptions={model.catalog.categoryOptions}
      categoryTaxRate={model.catalog.categoryTaxRateText} showProductKind isUpdate={model.isUpdate} disabled={model.readOnly}/>
  </ProductSpuSectionPanel>;
}
export function ProductCreateVariants({model}:{model:ProductCreateModel}) {
  const {catalog,form}=model;
  const taxRate=useWatch({control:form.control,name:'taxRateOverride'});
  const attributeError=form.formState.errors.attributes?.message;
  return <ProductSpuSectionPanel title="Biến thể và tồn kho" icon={<Archive size={20} color="#737373"/>}>
    <Stack>
      <Typography sx={{...TYPOGRAPHY_STYLES.sm.semibold,color:'#6B7280'}}>Thuộc tính</Typography>
      {catalog.matrixError?<Alert severity="error">{catalog.matrixError instanceof Error?catalog.matrixError.message:'Không thể tải ma trận SKU.'}</Alert>:null}
      <ProductSpuVariantMatrix readOnly={model.readOnly} appliedAttributeSummaries={catalog.summaries}
        attributeOrder={catalog.attributeOrder} keyRows={EMPTY_VARIANT_KEYS} attributeTreeOptions={catalog.attributeOptions}
        selectedAttributes={catalog.selected} onSelectedAttributesChange={catalog.setSelected}
        onAttributeSelectOpenChange={catalog.setSelectOpen} attributeTreeLoading={catalog.attributeLoading}
        categoryTaxRate={catalog.categoryTaxRate} productTaxRateOverride={taxRate??null}
        appliedAttributesError={Boolean(form.formState.errors.attributes)} appliedAttributesErrorMessage={attributeError}
        skuMatrixPreviewFlatRows={catalog.flatRows} skuMatrixPreviewLoading={catalog.matrixLoading}
        enableSortableAttributeSummaries onReorderAppliedAttributes={catalog.setOrder}
        onLeafSkuRowsChange={model.setSkus} skuMatrixLeafFieldErrors={mapRhfSkuRowErrorsToLeafFieldErrors(form.formState.errors.skus)}/>
    </Stack>
  </ProductSpuSectionPanel>;
}
export function ProductCreateSeo({model}:{model:ProductCreateModel}) {
  return <ProductSpuSectionPanel title="Cấu hình SEO" icon={<FolderSearch size={20} color="#737373"/>}>
    <ProductSpuSeoFormFields control={model.form.control} disabled={model.readOnly}/>
  </ProductSpuSectionPanel>;
}
