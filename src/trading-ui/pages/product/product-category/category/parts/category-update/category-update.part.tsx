import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Stack, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';
import { type Attribute, categoryApi, type CategoryRequestDto } from '@/trading-ui/apis/pim';
import { CustomButton } from '../../../../../../components/button';
import { productCategoryButtonPermission } from '../../../../product-permission.constants';
import { SnackbarType, useSnackbar } from '../../../../../../hooks/use-snackbar.hook';
import { TYPOGRAPHY_STYLES } from '../../../../../../common/constant/typography.constant';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../../components/styled/stack.style';
import { categoryFormSchema } from '../../category.constant';
import { ButtonIconContentComponent } from '../../../../../../components/button';
import type { CategoryGlobalState } from '../../category.interface';
import { SelectAllInput, TextInput } from '../../../../../../components/form';
import { HighlightStatusToggle } from '../../../../../../components/switch/highlight-status-toggle.component';
import { Edit02 } from '@untitledui/icons';
import { getErrorMessage } from '../../../../../../common/utils';
import { CategoryPageViews } from '../../category.enum';
import { ChipComponent } from '../../../../../../components/chip/chip.component';
import { CategoryStatus } from '../../../../../../apis/category/category.enum';

export interface CategoryUpdatePartProps {
  screenState: CategoryGlobalState;
  setScreenState: React.Dispatch<React.SetStateAction<CategoryGlobalState>>;
  attributeList: Attribute[];
}

export const CategoryUpdatePart: React.FC<CategoryUpdatePartProps> = ({ screenState, setScreenState, attributeList }) => {
  // hook
  const { showSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig();

  // state
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // function
  const { data: category } = useSWR(['category-detail', screenState.selectedCategoryId], () => categoryApi.getCategoryDetail(screenState.selectedCategoryId ?? ''), { revalidateOnFocus: false });

  const inheritedAttributeIdSet = useMemo(() => new Set((category?.inheritedAttributes ?? []).map((attribute) => attribute.id)), [category]);

  const readonlyInheritedAttributeOptions = useMemo(() => (category?.inheritedAttributes ?? []).map((a) => ({ value: a.id, label: a.name })), [category]);

  const attributeSelectOptionsExcludingInherited = useMemo(
    () => attributeList.filter((attribute) => !inheritedAttributeIdSet.has(attribute.id)).map((attribute) => ({ value: attribute.id, label: attribute.name })),
    [attributeList, inheritedAttributeIdSet],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<CategoryRequestDto>({
    resolver: yupResolver(categoryFormSchema),
    mode: 'onSubmit',
  });

  // Chỉ phụ thuộc `category` — không đưa `effectiveAttributeIds` vào deps (mỗi render là mảng mới → reset vòng lặn vô hạn).
  useEffect(() => {
    if (!category) return;
    const directIds = category.effectiveAttributes?.map((attribute) => attribute.id) ?? category.directAttributeIds ?? [];
    reset({
      name: category.name,
      code: category.code,
      taxRate: category.taxRate,
      directAttributeIds: directIds,
      status: category.status,
    });
  }, [category, reset]);

  const onSubmit: SubmitHandler<CategoryRequestDto> = async (values) => {
    if (!category) return;
    setLoading(true);
    try {
      const updateCategoryDto: CategoryRequestDto = {
        ...(category.parentId ? { parentId: category.parentId } : {}),
        ...values,
        directAttributeIds: (values.directAttributeIds ?? []).filter((attributeId) => !inheritedAttributeIdSet.has(attributeId)),
      };
      await categoryApi.patchCategory(category.id, updateCategoryDto);
      await mutate((key) => Array.isArray(key) && key[0] === 'product/admin/categories/tree', undefined, {
        revalidate: true,
      });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Cập nhật danh mục thành công' });
      setScreenState({
        ...screenState,
        view: CategoryPageViews.LIST,
        selectedCategoryId: undefined,
        createParent: null,
      });
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <Stack sx={{ gap: 3 }}>
        <StackRowAlignCenterJustBetween>
          <StackRowAlignCenter sx={{ gap: 0.5 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#6B7280' }}>Chi tiết danh mục:</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#000' }}>{category?.name}</Typography>
          </StackRowAlignCenter>
          <ButtonIconContentComponent
            content="Chỉnh sửa"
            icon={<Edit02 size={20} color="#737373" />}
            onClick={() => {
              setEditing(true);
            }}
            {...productCategoryButtonPermission('edit', 'Chỉnh sửa danh mục', 'api_category_update')}
            sx={{ color: '#101828', border: '1px solid #111827', padding: '6px 12px' }}
          />
        </StackRowAlignCenterJustBetween>
        <Stack sx={{ gap: 2 }}>
          <StackRowAlignCenter gap={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#475467' }}>Tên danh mục</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{category?.name}</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#475467' }}>Mã danh mục</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{category?.code ?? '—'}</Typography>
            </Box>
          </StackRowAlignCenter>

          <StackRowAlignCenter gap={2} sx={{ alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#475467' }}>Thuế VAT</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{category?.taxRate || '0'}%</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#475467' }}>Bộ thuộc tính gán</Typography>
              <ChipComponent tags={(category?.effectiveAttributes ?? []).map((attribute) => attribute.name)} />
            </Box>
          </StackRowAlignCenter>
        </Stack>

        <HighlightStatusToggle
          label="Hiển thị lên website"
          checked={category?.status === CategoryStatus.ACTIVE}
          readOnly
          statusLabel={category?.status === CategoryStatus.ACTIVE ? 'Kích hoạt' : 'Vô hiệu hóa'}
        />
      </Stack>
    );
  }

  return (
    <Stack component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <StackRowAlignCenterJustBetween>
        <StackRowAlignCenter sx={{ gap: 0.5 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#6B7280' }}>Chi tiết danh mục:</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#000' }}>{category?.name}</Typography>
        </StackRowAlignCenter>
        <StackRowAlignCenter gap={1}>
          <CustomButton
            variant="outline"
            fullWidth={false}
            disabled={loading}
            onClick={() => {
              setEditing(false);
              setScreenState({
                ...screenState,
                view: CategoryPageViews.LIST,
                selectedCategoryId: undefined,
                createParent: null,
              });
            }}
            sx={{
              textTransform: 'none',
              borderColor: '#101828',
              color: '#101828',
              '&:hover': { borderColor: '#101828' },
            }}
          >
            Hủy
          </CustomButton>
          <CustomButton
            variant="primary"
            fullWidth={false}
            type="submit"
            disabled={loading || !isDirty}
            {...productCategoryButtonPermission('edit', 'Lưu danh mục', 'api_category_update')}
            sx={{
              textTransform: 'none',
              bgcolor: '#101828',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#101828', opacity: 0.92 },
            }}
          >
            Lưu
          </CustomButton>
        </StackRowAlignCenter>
      </StackRowAlignCenterJustBetween>

      <StackRowAlignCenter gap={2}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Tên Danh mục"
                name={field.name}
                value={field.value}
                requiredMark
                placeholder="VD: Ring"
                error={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
                onChange={field.onChange}
              />
            )}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Controller
            name="code"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Mã Danh mục"
                name={field.name}
                value={field.value}
                requiredMark
                placeholder="VD: 752"
                error={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
                onChange={field.onChange}
              />
            )}
          />
        </Box>
      </StackRowAlignCenter>

      <StackRowAlignCenter sx={{ alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Controller
            name="taxRate"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Thuế VAT"
                name={field.name}
                value={field.value}
                requiredMark
                type="number"
                placeholder="VD: 10"
                error={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
                onChange={field.onChange}
              />
            )}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Controller
            name="directAttributeIds"
            control={control}
            render={({ field, fieldState }) => (
              <SelectAllInput
                label="Bộ thuộc tính gán"
                readonlyPrefixOptions={readonlyInheritedAttributeOptions}
                value={(field.value || []).filter((id) => !inheritedAttributeIdSet.has(id))}
                placeholder="Chọn thuộc tính"
                options={attributeSelectOptionsExcludingInherited}
                error={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
                onChange={(e) => {
                  const raw = (e.target as EventTarget & { value: unknown }).value;
                  const nextExtra = Array.isArray(raw) ? raw.map(String) : [];
                  const inheritedIds = (category?.inheritedAttributes ?? []).map((a) => a.id);
                  field.onChange([...inheritedIds, ...nextExtra]);
                }}
              />
            )}
          />
        </Box>
      </StackRowAlignCenter>
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <HighlightStatusToggle
            label="Hiển thị lên website"
            checked={field.value === CategoryStatus.ACTIVE}
            disabled={loading}
            name={field.name}
            onCheckedChange={(nextChecked) => {
              field.onChange(nextChecked ? CategoryStatus.ACTIVE : CategoryStatus.INACTIVE);
            }}
          />
        )}
      />
    </Stack>
  );
};
