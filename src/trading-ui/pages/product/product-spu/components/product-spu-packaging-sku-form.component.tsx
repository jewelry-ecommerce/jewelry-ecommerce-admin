import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { SelectInput, TextInput } from '../../../../components/form';
import { ProductSpuMoneyInput } from './product-spu-money-input.component';
import { StackRowAlignCenter } from '../../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { TextFieldUpload } from '../../../../components/text-field-upload/text-field-upload.component';
import { uploadMultipleImages } from '../../../../common/utils/image-upload.utils';
import { MediaVisibility } from '../../../../apis/file';
import { PackagingType, ProductSkuStatus } from '../../../../apis';
import { PACKAGING_TYPE_OPTIONS, SHIPPING_PACKAGING_TYPE_OPTIONS } from '../product-spu.constant';

export type ProductSpuPackagingSkuFormVariant = 'retail_packaging' | 'shipping_packaging';

interface ProductSpuPackagingSkuFormProps {
  control: Control<FieldValues>;
  fieldPrefix: string;
  disabled?: boolean;
  skuCodeDisabled?: boolean;
  variant?: ProductSpuPackagingSkuFormVariant;
}

export const ProductSpuPackagingSkuForm = ({ control, fieldPrefix, disabled = false, skuCodeDisabled = false, variant = 'retail_packaging' }: ProductSpuPackagingSkuFormProps) => {
  const isShippingPackaging = variant === 'shipping_packaging';
  const field = <T extends FieldValues>(name: string) => `${fieldPrefix}.${name}` as Path<T>;
  const packagingTypeOptions = isShippingPackaging ? [...SHIPPING_PACKAGING_TYPE_OPTIONS] : [...PACKAGING_TYPE_OPTIONS];
  const defaultPackagingType = isShippingPackaging ? PackagingType.CARTON_BOX : PackagingType.BOX;

  return (
    <Stack gap={2}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>
        {isShippingPackaging ? 'Bao bì đóng gói dùng theo đơn hàng. Hết tồn kho thì không thể đặt đơn.' : 'Bao bì & hộp có thể được gắn vào nhiều sản phẩm khác hoặc bán lẻ nếu muốn.'}
      </Typography>
      <StackRowAlignCenter gap={2} sx={{ alignItems: 'flex-start' }}>
        <Controller
          control={control}
          name={field('skuCode')}
          render={({ field: inputField, fieldState }) => (
            <TextInput
              {...inputField}
              value={inputField.value ?? ''}
              label="Mã biến thể"
              requiredMark
              placeholder="VD: BOX-RING-01"
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              disabled={disabled || skuCodeDisabled}
            />
          )}
        />
        <Controller
          control={control}
          name={field('status')}
          render={({ field: inputField, fieldState }) => (
            <SelectInput
              {...inputField}
              value={inputField.value ?? ProductSkuStatus.ACTIVE}
              label="Trạng thái"
              requiredMark
              options={[
                { value: ProductSkuStatus.ACTIVE, label: 'Kích hoạt' },
                { value: ProductSkuStatus.INACTIVE, label: 'Không kích hoạt' },
              ]}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              disabled={disabled}
            />
          )}
        />
      </StackRowAlignCenter>
      {!isShippingPackaging ? (
        <StackRowAlignCenter gap={2} sx={{ alignItems: 'flex-start' }}>
          <Controller
            control={control}
            name={field('sellingPriceAfterTaxMinor')}
            render={({ field: inputField, fieldState }) => (
              <ProductSpuMoneyInput
                value={inputField.value ?? ''}
                onChange={(raw) => inputField.onChange(raw === '' ? '' : Number(raw))}
                label="Giá bán lẻ"
                requiredMark
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                disabled={disabled}
              />
            )}
          />
          <Controller
            control={control}
            name={field('packagingIncludedPriceAfterTax')}
            render={({ field: inputField, fieldState }) => (
              <ProductSpuMoneyInput
                value={inputField.value ?? ''}
                onChange={(raw) => inputField.onChange(raw === '' ? '' : Number(raw))}
                label="Giá đi kèm (nếu có)"
                placeholder="0 nếu miễn phí khi đi kèm sản phẩm"
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                disabled={disabled}
              />
            )}
          />
          <Controller
            control={control}
            name={field('costPriceAfterTaxMinor')}
            render={({ field: inputField, fieldState }) => (
              <ProductSpuMoneyInput
                value={inputField.value ?? ''}
                onChange={(raw) => inputField.onChange(raw === '' ? '' : Number(raw))}
                label="Giá nhập (sau thuế)"
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                disabled={disabled}
              />
            )}
          />
        </StackRowAlignCenter>
      ) : (
        <StackRowAlignCenter gap={2} sx={{ alignItems: 'flex-start' }}>
          <Controller
            control={control}
            name={field('costPriceAfterTaxMinor')}
            render={({ field: inputField, fieldState }) => (
              <ProductSpuMoneyInput
                value={inputField.value ?? ''}
                onChange={(raw) => inputField.onChange(raw === '' ? '' : Number(raw))}
                label="Giá nhập (sau thuế)"
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                disabled={disabled}
              />
            )}
          />
        </StackRowAlignCenter>
      )}
      <StackRowAlignCenter gap={2} sx={{ alignItems: 'flex-start' }}>
        <Controller
          control={control}
          name={field('packagingType')}
          render={({ field: inputField, fieldState }) => (
            <SelectInput
              {...inputField}
              value={inputField.value ?? defaultPackagingType}
              label={isShippingPackaging ? 'Đóng gói' : 'Loại bao bì / hộp'}
              options={packagingTypeOptions}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              disabled={disabled}
            />
          )}
        />
        <Controller
          control={control}
          name={field('weight')}
          render={({ field: inputField, fieldState }) => (
            <TextInput {...inputField} type="number" value={inputField.value ?? ''} label="Cân nặng (gram)" error={!!fieldState.error} errorMessage={fieldState.error?.message} disabled={disabled} />
          )}
        />
      </StackRowAlignCenter>
      <StackRowAlignCenter gap={2} sx={{ alignItems: 'flex-start' }}>
        <Controller
          control={control}
          name={field('length')}
          render={({ field: inputField, fieldState }) => (
            <TextInput {...inputField} type="number" value={inputField.value ?? ''} label="Dài (cm)" error={!!fieldState.error} errorMessage={fieldState.error?.message} disabled={disabled} />
          )}
        />
        <Controller
          control={control}
          name={field('width')}
          render={({ field: inputField, fieldState }) => (
            <TextInput {...inputField} type="number" value={inputField.value ?? ''} label="Rộng (cm)" error={!!fieldState.error} errorMessage={fieldState.error?.message} disabled={disabled} />
          )}
        />
        <Controller
          control={control}
          name={field('height')}
          render={({ field: inputField, fieldState }) => (
            <TextInput {...inputField} type="number" value={inputField.value ?? ''} label="Cao (cm)" error={!!fieldState.error} errorMessage={fieldState.error?.message} disabled={disabled} />
          )}
        />
      </StackRowAlignCenter>
      {!isShippingPackaging ? (
        <Controller
          control={control}
          name={field('packagingCanBeSold')}
          render={({ field: canBeSoldField }) => (
            <Controller
              control={control}
              name={field('packagingIsVisible')}
              render={({ field: isVisibleField }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(canBeSoldField.value)}
                      onChange={(_, checked) => {
                        canBeSoldField.onChange(checked);
                        isVisibleField.onChange(checked);
                      }}
                      disabled={disabled}
                    />
                  }
                  label="Cho phép bán lẻ ?"
                />
              )}
            />
          )}
        />
      ) : null}
      <Controller
        control={control}
        name={field('medias')}
        render={({ field: inputField, fieldState }) => {
          const medias = Array.isArray(inputField.value) ? inputField.value : [];
          return (
            <TextFieldUpload
              label="Ảnh hộp / bao bì"
              value={medias[0] ?? ''}
              onChange={(next) => inputField.onChange(next ? [next] : [])}
              accept="image"
              disabled={disabled}
              onPickFile={async (file) => {
                const [uploaded] = await uploadMultipleImages([{ file, visibility: MediaVisibility.PUBLIC }]);
                const url = uploaded?.asset?.publicUrl;
                if (url) inputField.onChange([url]);
              }}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          );
        }}
      />
    </Stack>
  );
};

export default ProductSpuPackagingSkuForm;
