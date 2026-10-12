import { Stack, Box, Typography } from '@mui/material';
import { Star01 } from '@untitledui/icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { DialogComponent } from '../../../../../components/dialog';
import { TextFieldUploadBrand } from '../../components/text-field-upload-brand.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { brandFormSchema, CODE_FOCUS_HINT } from '../../product-brand.constant';
import { TextInput } from '../../../../../components/form';
import { type ProductBrandDialogFormValues } from '../../product-brand.interface';
import { BrandStatus } from '../../../../../apis/brand/brand.enum';
import { SwitchContentElement } from '../../../../../components/switch/switch-content.element';
import { getErrorMessage } from '../../../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../components/styled';
import { createBrand } from '../../../../../apis/brand/brand.api';
import { productListButtonPermission } from '../../../product-permission.constants';

const DEFAULT_BRAND_FORM: ProductBrandDialogFormValues = {
  name: '',
  code: '',
  // websiteUrl: '',
  description: '',
  logoUrl: '',
  status: BrandStatus.ACTIVE,
};

export interface ProductBrandCreatePartProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

export const ProductBrandCreatePart = ({ open, onClose, onSuccess }: ProductBrandCreatePartProps) => {
  // hook
  const { showSnackbar } = useSnackbar();

  // state
  const [codeFocused, setCodeFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  // function
  const { control, handleSubmit, reset } = useForm<ProductBrandDialogFormValues>({
    resolver: yupResolver(brandFormSchema),
    mode: 'onSubmit',
    defaultValues: DEFAULT_BRAND_FORM,
  });

  const handleClose = () => {
    reset(DEFAULT_BRAND_FORM);
    setCodeFocused(false);
    onClose();
  };

  const onSubmit = async (values: ProductBrandDialogFormValues) => {
    setLoading(true);
    try {
      await createBrand({
        code: values.code,
        name: values.name,
        image: values.logoUrl || null,
        // websiteUrl: values.websiteUrl?.trim() || null,
        status: values.status,
      });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Tạo thương hiệu thành công' });
      await onSuccess?.();
      handleClose();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogComponent
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { maxWidth: '720px' } }}
      title="Tạo thương hiệu"
      buttonLeft={{
        content: 'Huỷ bỏ',
        variant: 'outlined',
        onClick: handleClose,
        disabled: loading,
      }}
      buttonRight={{
        content: 'Lưu thay đổi',
        variant: 'contained',
        onClick: handleSubmit(onSubmit),
        disabled: loading,
        loading: loading,
        ...productListButtonPermission('create_brand', 'Lưu thương hiệu mới', 'api_brand_create'),
      }}
    >
      <Stack component="form" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="code"
          control={control}
          render={({ field, fieldState }) => (
            <Box sx={{ width: '100%' }}>
              <TextInput
                {...field}
                label="Mã thương hiệu"
                requiredMark
                placeholder="VD: A1"
                error={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
                onFocus={() => setCodeFocused(true)}
                onBlur={() => {
                  setCodeFocused(false);
                  field.onBlur();
                }}
              />
              {codeFocused ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mt: 0.75 }}>{CODE_FOCUS_HINT}</Typography> : null}
            </Box>
          )}
        />

        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Tên thương hiệu" requiredMark placeholder="VD: Brand A" error={Boolean(fieldState.error)} errorMessage={fieldState.error?.message} />
          )}
        />

        <Controller
          name="websiteUrl"
          control={control}
          render={({ field, fieldState }) => <TextInput {...field} label="URL" requiredMark placeholder="VD: http://" error={Boolean(fieldState.error)} errorMessage={fieldState.error?.message} />}
        />

        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Mô tả" placeholder="Nhập mô tả..." error={Boolean(fieldState.error)} errorMessage={fieldState.error?.message} multiline minRows={4} />
          )}
        />

        <Controller
          name="logoUrl"
          control={control}
          render={({ field, fieldState }) => (
            <TextFieldUploadBrand label="Logo" value={field.value ?? ''} onChange={field.onChange} error={Boolean(fieldState.error)} errorMessage={fieldState.error?.message} />
          )}
        />
      </Stack>

      <StackRowAlignCenterJustBetween
        sx={{
          mt: 3,
          mx: '-24px',
          px: '24px',
          py: 2,
          bgcolor: '#FEFCE8',
          borderTop: '1px solid #EAB308',
          borderBottom: '1px solid #EAB308',
        }}
      >
        <StackRowAlignCenter sx={{ gap: 1 }}>
          <Star01 color="#CA8A04" size={18} />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#CA8A04' }}>Trạng thái</Typography>
        </StackRowAlignCenter>

        <StackRowAlignCenter sx={{ gap: 1 }}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SwitchContentElement
                content={field.value === BrandStatus.ACTIVE ? 'Kích hoạt' : 'Vô hiệu hóa'}
                value={field.value === BrandStatus.ACTIVE}
                name={field.name}
                onChange={(e) => {
                  const nextChecked = Boolean(e?.target?.value);
                  field.onChange(nextChecked ? BrandStatus.ACTIVE : BrandStatus.INACTIVE);
                }}
              />
            )}
          />
        </StackRowAlignCenter>
      </StackRowAlignCenterJustBetween>
    </DialogComponent>
  );
};
