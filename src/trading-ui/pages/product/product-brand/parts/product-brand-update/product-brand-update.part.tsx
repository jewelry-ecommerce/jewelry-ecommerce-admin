import { DialogComponent } from '../../../../../components/dialog';
import { Box, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Star01 } from '@untitledui/icons';
import { Controller, useForm } from 'react-hook-form';
import { StackRowAlignCenterJustBetween, StackRowAlignCenter } from '@/trading-ui/adapters/library';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { TextFieldUploadBrand } from '../../components/text-field-upload-brand.component';
import { brandFormSchema, CODE_FOCUS_HINT } from '../../product-brand.constant';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextInput } from '../../../../../components/form';
import { ProductBrandDeactivateConfirmDialog } from '../../components/product-brand-deactivate-confirm-dialog.component';
import type { ProductBrandDialogFormValues } from '../../product-brand.interface';
import { SwitchContentElement } from '../../../../../components/switch/switch-content.element';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { getErrorMessage } from '../../../../../common/utils';
import { BrandStatus } from '../../../../../apis';
import { updateBrand } from '../../../../../apis/brand/brand.api';
import { productListButtonPermission } from '../../../product-permission.constants';

export interface ProductBrandUpdatePartProps {
  open: boolean;
  brandId: string;
  initialValues: Partial<ProductBrandDialogFormValues>;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

export const ProductBrandUpdatePart = ({ open, brandId, initialValues, onClose, onSuccess }: ProductBrandUpdatePartProps) => {
  // hook
  const { showSnackbar } = useSnackbar();

  // state
  const [codeFocused, setCodeFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);

  // function
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isDirty },
  } = useForm<ProductBrandDialogFormValues>({
    resolver: yupResolver(brandFormSchema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const onSubmit = async (values: ProductBrandDialogFormValues) => {
    setLoading(true);
    try {
      if (!brandId) return;
      await updateBrand(brandId, {
        code: values.code,
        name: values.name,
        image: values.logoUrl || null,
        // websiteUrl: values.websiteUrl?.trim() || null,
        status: values.status,
      });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Cập nhật thương hiệu thành công' });
      await onSuccess?.();
      onClose();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <DialogComponent
        open={open}
        onClose={onClose}
        maxWidth="md"
        PaperProps={{ sx: { maxWidth: '720px' } }}
        title="Chỉnh sửa thương hiệu"
        buttonLeft={{
          content: 'Huỷ bỏ',
          variant: 'outlined',
          onClick: onClose,
          disabled: loading,
        }}
        buttonRight={{
          content: 'Lưu thay đổi',
          variant: 'contained',
          onClick: handleSubmit(onSubmit),
          disabled: loading || !isDirty,
          loading: loading,
          ...productListButtonPermission('edit_brand', 'Lưu chỉnh sửa thương hiệu', 'api_brand_update'),
        }}
      >
        <Stack component="form" onSubmit={handleSubmit(onSubmit)} sx={{ gap: 2 }}>
          <Controller
            name="code"
            control={control}
            render={({ field, fieldState }) => (
              <Box sx={{ width: '100%' }}>
                <TextInput
                  label="Mã thương hiệu"
                  {...field}
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
              <TextInput label="Tên thương hiệu" requiredMark {...field} placeholder="VD: Brand A" error={Boolean(fieldState.error)} errorMessage={fieldState.error?.message} />
            )}
          />

          <Controller
            name="websiteUrl"
            control={control}
            render={({ field, fieldState }) => <TextInput label="URL" requiredMark {...field} placeholder="VD: http://" error={Boolean(fieldState.error)} errorMessage={fieldState.error?.message} />}
          />

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput label="Mô tả" {...field} placeholder="Nhập mô tả..." error={Boolean(fieldState.error)} errorMessage={fieldState.error?.message} multiline minRows={4} />
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
            gap: 2,
          }}
        >
          <StackRowAlignCenter sx={{ gap: 1 }}>
            <Star01 color="#CA8A04" fontSize={18} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#CA8A04' }}>Trạng thái</Typography>
          </StackRowAlignCenter>

          <StackRowAlignCenter sx={{ gap: 1 }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => {
                const isActive = field.value === BrandStatus.ACTIVE;
                return (
                  <SwitchContentElement
                    content={isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                    value={isActive}
                    name={field.name}
                    onChange={(e) => {
                      const nextChecked = Boolean(e?.target?.value);
                      if (isActive && !nextChecked) {
                        setDeactivateConfirmOpen(true);
                        return;
                      }
                      field.onChange(nextChecked ? BrandStatus.ACTIVE : BrandStatus.INACTIVE);
                    }}
                  />
                );
              }}
            />
          </StackRowAlignCenter>
        </StackRowAlignCenterJustBetween>
      </DialogComponent>

      <ProductBrandDeactivateConfirmDialog
        open={deactivateConfirmOpen}
        brandName={initialValues?.name ?? '—'}
        onDismiss={() => setDeactivateConfirmOpen(false)}
        onConfirm={() => {
          setValue('status', BrandStatus.INACTIVE, { shouldDirty: true, shouldTouch: true });
          setDeactivateConfirmOpen(false);
        }}
      />
    </React.Fragment>
  );
};
