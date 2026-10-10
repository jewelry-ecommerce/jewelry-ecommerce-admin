import { Box, Stack, Typography } from '@mui/material';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { SelectInput, TextInput } from '../../../../components/form';
import { SelectAttributeTreeInput, type AttributeTreeSelectOption } from '../../../../components/form/select-attribute-tree-input';
import { getCategoryTreeValuesFromUuid, getCategoryUuidFromTreeSelection } from '../utils/product-spu-category-tree.utils';
import type { ProductInfoFormItem } from '../../../../apis/product/product.interface';
import { StackRow } from '../../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { ProductKind, ProductUnitOfMeasure, PRODUCT_UNIT_OF_MEASURE_OPTIONS } from '../../../../apis/product/product.enum';
import { PRODUCT_KIND_OPTIONS } from '../product-spu.constant';
import { ProductSpuInfosForm } from './product-spu-infos-form.component';


export type ProductSpuFormProps<TFieldValues extends FieldValues = FieldValues> = {
  control: Control<TFieldValues>;
  categoryTreeOptions?: readonly AttributeTreeSelectOption[];
  seasonOptions?: ReadonlyArray<{ value: string; label: string }>;
  categoryTaxRate?: string | number | null;
  showProductKind?: boolean;
  hideTaxonomy?: boolean;
  isUpdate?: boolean;
  disabled?: boolean;
};

export const ProductSpuForm = <TFieldValues extends FieldValues = FieldValues>({
  control,
  categoryTreeOptions = [],
  seasonOptions = [],
  categoryTaxRate = null,
  showProductKind = false,
  hideTaxonomy = false,
  isUpdate = false,
  disabled = false,
}: ProductSpuFormProps<TFieldValues>) => {
  return (
    <Box component="form" noValidate onSubmit={(event) => event.preventDefault()}>
      <Stack sx={{ width: '100%' }}>
        <StackRow>
          <Controller
            control={control}
            name={'spuCode' as Path<TFieldValues>}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={field.value ?? ''}
                label="Mã sản phẩm"
                requiredMark
                placeholder="VD: SP00001"
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                disabled={isUpdate || disabled}
              />
            )}
          />
          <Controller
            control={control}
            name={'name' as Path<TFieldValues>}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={field.value ?? ''}
                label="Tên sản phẩm"
                requiredMark
                placeholder="VD: RING"
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                disabled={disabled}
              />
            )}
          />
        </StackRow>

        {showProductKind ? (
          <StackRow>
            <Controller
              control={control}
              name={'productKind' as Path<TFieldValues>}
              render={({ field, fieldState }) => (
                <SelectInput
                  {...field}
                  value={field.value ?? ProductKind.MERCHANDISE}
                  label="Loại sản phẩm"
                  requiredMark
                  options={[...PRODUCT_KIND_OPTIONS]}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  disabled={isUpdate || disabled}
                />
              )}
            />
            <Controller
              control={control}
              name={'unitOfMeasure' as Path<TFieldValues>}
              render={({ field, fieldState }) => (
                <SelectInput
                  {...field}
                  value={field.value ?? ProductUnitOfMeasure.EACH}
                  label="Đơn vị tính"
                  requiredMark
                  placeholder="Vui lòng chọn"
                  options={[...PRODUCT_UNIT_OF_MEASURE_OPTIONS]}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  disabled={disabled}
                />
              )}
            />
          </StackRow>
        ) : (
          <Controller
            control={control}
            name={'unitOfMeasure' as Path<TFieldValues>}
            render={({ field, fieldState }) => (
              <SelectInput
                {...field}
                value={field.value ?? ProductUnitOfMeasure.EACH}
                label="Đơn vị tính"
                requiredMark
                placeholder="Vui lòng chọn"
                options={[...PRODUCT_UNIT_OF_MEASURE_OPTIONS]}
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                disabled={disabled}
              />
            )}
          />
        )}

        {hideTaxonomy ? null : (
          <StackRow>
            <Controller
              control={control}
              name={'categoryUuid' as Path<TFieldValues>}
              render={({ field, fieldState }) => (
                <SelectAttributeTreeInput
                  label="Danh mục"
                  requiredMark
                  placeholder="Vui lòng chọn"
                  options={[...categoryTreeOptions]}
                  value={getCategoryTreeValuesFromUuid(String(field.value ?? ''), categoryTreeOptions)}
                  onChange={(next) => field.onChange(getCategoryUuidFromTreeSelection(next))}
                  selectionMode="single"
                  optionIndicator="none"
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  disabled={disabled}
                />
              )}
            />
            <Controller
              control={control}
name={'seasonUuid' as Path<TFieldValues>}
              render={({ field, fieldState }) => (
                <SelectInput
                  {...field}
                  value={field.value ?? ''}
                  label="Mùa vụ"
                  placeholder="Vui lòng chọn"
                  requiredMark
                  options={[...seasonOptions]}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  disabled={disabled}
                />
              )}
            />
          </StackRow>
        )}
        <StackRow>
          <Controller
            control={control}
            name={'taxRateOverride' as Path<TFieldValues>}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                type="number"
                value={field.value ?? ''}
                label="Thuế ghi đè sản phẩm (%)"
                placeholder="Để trống = dùng thuế danh mục"
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                disabled={disabled}
              />
            )}
          />
          {hideTaxonomy ? null : <TextInput type="number" value={categoryTaxRate ?? ''} label="Thuế danh mục (%)" disabled />}
        </StackRow>
        <ProductSpuInfosForm control={control as unknown as Control<{ productInfos?: ProductInfoFormItem[] }>} disabled={disabled} />
      </Stack>
    </Box>
  );
};

export type ProductSpuSeoFormFieldsProps<TFieldValues extends FieldValues = FieldValues> = {
  control: Control<TFieldValues>;
  disabled?: boolean;
};

export const ProductSpuSeoFormFields = <TFieldValues extends FieldValues = FieldValues>({ control, disabled = false }: ProductSpuSeoFormFieldsProps<TFieldValues>) => (
  <Stack>
    <StackRow sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
      <Controller
        control={control}
        name={'metaTitle' as Path<TFieldValues>}
        render={({ field, fieldState }) => (
          <Stack gap={1}>
            <TextInput
              {...field}
              value={field.value ?? ''}
              label="Tiêu đề SEO"
              placeholder="Vui lòng nhập tiêu đề"
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              disabled={disabled}
              requiredMark
            />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Toi da 70 ky tu.</Typography>
          </Stack>
        )}
      />
      <Controller
        control={control}
        name={'metaKeywords' as Path<TFieldValues>}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            value={field.value ?? ''}
            label="Từ khóa SEO"
            placeholder="VD: nhận, ngọc trải"
            requiredMark
            error={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            disabled={disabled}
          />
        )}
      />
    </StackRow>
    <Controller
      control={control}
      name={'metaDescription' as Path<TFieldValues>}
      render={({ field, fieldState }) => (
        <Stack gap={1}>
          <TextInput
            {...field}
            value={field.value ?? ''}
            label="Mô tả"
            placeholder="VD: Sản phẩm"
            requiredMark
            error={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            disabled={disabled}
          />
          <Box component="span" sx={{ typography: 'body2', color: '#6B7280' }}>
            Tối đa 160 ký tự.
          </Box>
        </Stack>
      )}
    />
  </Stack>
);
