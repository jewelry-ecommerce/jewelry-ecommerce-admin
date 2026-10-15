import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Stack, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';
import { type Attribute, categoryApi, type CategoryRequestDto } from '../../../../../../apis';
import { CustomButton } from '../../../../../../components/button';
import { productCategoryButtonPermission } from '../../../../product-permission.constants';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { TYPOGRAPHY_STYLES } from '../../../../../../common/constant/typography.constant';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../../components/styled/stack.style';
import { categoryFormSchema } from '../../category.constant';
import type { CategoryGlobalState } from '../../category.interface';
import { SelectAllInput, TextInput } from '../../../../../../components/form';
import { getErrorMessage } from '../../../../../../common/utils';
import { CategoryPageViews } from '../../category.enum';
import { HighlightStatusToggle } from '../../../../../../components/switch/highlight-status-toggle.component';
import { CategoryStatus } from '../../../../../../apis/category/category.enum';

export interface CategoryCreatePartProps {
  screenState: CategoryGlobalState;
  setScreenState: React.Dispatch<React.SetStateAction<CategoryGlobalState>>;
  attributeList: Attribute[];
}

export const CategoryCreatePart: React.FC<CategoryCreatePartProps> = ({ screenState, setScreenState, attributeList }) => {
  // hook
  const { showSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig();

  const createParentId = screenState.createParent?.id;
  const { data: parentCategory } = useSWR(createParentId ? ['category-detail', 'create-under', createParentId] : null, () => categoryApi.getCategoryDetail(createParentId!), {
    revalidateOnFocus: false,
  });

  /** Thuộc tính cha đã có (effective) — con kế thừa, không gửi lại trong directAttributeIds. */
  const parentEffectiveIdSet = useMemo(() => new Set((parentCategory?.effectiveAttributes ?? []).map((a) => a.id)), [parentCategory]);

  const attributeOptionsForChild = useMemo(
    () => attributeList.filter((attribute) => !parentEffectiveIdSet.has(attribute.id)).map((attribute) => ({ value: attribute.id, label: attribute.name })),
    [attributeList, parentEffectiveIdSet],
  );

  const readonlyPrefixAttributeOptions = useMemo(
    () => (createParentId ? (parentCategory?.effectiveAttributes ?? []).map((a) => ({ value: a.id, label: a.name })) : []),
    [createParentId, parentCategory],
  );

  const selectAttributeOptions = useMemo(
    () => (createParentId ? attributeOptionsForChild : attributeList.map((a) => ({ value: a.id, label: a.name }))),
    [createParentId, attributeOptionsForChild, attributeList],
  );

  // state
  const [loading, setLoading] = useState(false);

  // function
  const { control, handleSubmit } = useForm<CategoryRequestDto>({
    resolver: yupResolver(categoryFormSchema),
    mode: 'onSubmit',
    defaultValues: { name: '', code: '', status: CategoryStatus.ACTIVE },
  });

  const onSubmit: SubmitHandler<CategoryRequestDto> = async (values) => {
    setLoading(true);
    try {
      const createCategoryDto: CategoryRequestDto = {
        ...(screenState.createParent ? { parentId: screenState.createParent.id } : {}),
        ...values,
        directAttributeIds: (values.directAttributeIds ?? []).filter((id) => !parentEffectiveIdSet.has(id)),
      };
      await categoryApi.postCategory(createCategoryDto);
      await mutate((key) => Array.isArray(key) && key[0] === 'product/admin/categories/tree', undefined, {
        revalidate: true,
      });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Tạo danh mục thành công' });
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

  return (
    <Stack component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <StackRowAlignCenterJustBetween>
        {screenState.createParent ? (
          <StackRowAlignCenter sx={{ gap: 0.5 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#6B7280' }}>Chi tiết danh mục:</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#000' }}>{screenState.createParent?.name}</Typography>
          </StackRowAlignCenter>
        ) : (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Tạo danh mục</Typography>
        )}
        <StackRowAlignCenter gap={1}>
          <CustomButton
            variant="outline"
            fullWidth={false}
            disabled={loading}
            onClick={() =>
              setScreenState({
                ...screenState,
                view: CategoryPageViews.LIST,
                selectedCategoryId: undefined,
                createParent: null,
              })
            }
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
            disabled={loading}
            {...productCategoryButtonPermission('create', 'Lưu danh mục', 'api_category_create')}
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
      <StackRowAlignCenter gap={2} sx={{ alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Controller
            name="directAttributeIds"
            control={control}
            render={({ field, fieldState }) => (
              <SelectAllInput
                label="Bộ thuộc tính gán"
                readonlyPrefixOptions={readonlyPrefixAttributeOptions}
                value={(field.value || []).filter((id) => !parentEffectiveIdSet.has(id))}
                placeholder="Chọn thuộc tính"
                options={selectAttributeOptions}
                error={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
                onChange={(e) => {
                  const raw = (e.target as EventTarget & { value: unknown }).value;
                  const next = Array.isArray(raw) ? raw.map(String) : [];
                  field.onChange(next.filter((id) => !parentEffectiveIdSet.has(id)));
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
