import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, Typography } from '@mui/material';
import { type BaseSyntheticEvent, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Controller, type Resolver, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { StackRowAlignCenter, STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import { LabelFormPageHeader } from '../../../content-display/label/components';
import { productAttributesButtonPermission } from '../../product-permission.constants';
import { StackRow } from '../../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { SelectInput, TextInput } from '../../../../components/form';
import { type ProductAttributeFormValues, PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS, createEmptyProductAttributeValueRow, productAttributeUpdateFormSchema } from '../product-attribute.constant';
import { ProductAttributeValuesList } from '../components/product-attribute-values-list.part';
import { attributeApi, AttributeDisplayType, AttributeStatus, type AttributeRequestDto } from '../../../../apis';
import { MediaVisibility } from '../../../../apis/file';
import { uploadSingleImage } from '../../../../common/utils/image-upload.utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { getErrorMessage } from '../../../../common/utils';
import { LoadingComponent } from '../../../../components/loading/loading.component';

const ProductAttributeUpdatePage = () => {
  // hook
  const navigate = useNavigate();
  const { attributeId } = useParams();
  const { showSnackbar } = useSnackbar();
  const initialPersistedValueCodesRef = useRef<Set<string>>(new Set());
  const initialAttributeMetaRef = useRef<Pick<AttributeRequestDto, 'name' | 'displayType' | 'status'> | null>(null);
  const initialValueByIdRef = useRef<Map<string, { value: string; image: string }>>(new Map());

  // state
  const [loading, setLoading] = useState(false);

  // function
  const { data: attribute, isLoading } = useSWR(attributeId ? ['product/admin/attributes/detail', attributeId] : null, () => attributeApi.getAttributeDetail(attributeId!), {
    revalidateOnFocus: false,
  });

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isDirty },
  } = useForm<ProductAttributeFormValues>({
    resolver: yupResolver(productAttributeUpdateFormSchema) as Resolver<ProductAttributeFormValues>,
    mode: 'onSubmit',
  });

  const displayType = useWatch({ control, name: 'displayType' }) ?? AttributeDisplayType.TEXT;

  useLayoutEffect(() => {
    if (!attribute) return;

    initialPersistedValueCodesRef.current = new Set((attribute.values ?? []).map((v) => v.code.trim()));

    initialAttributeMetaRef.current = {
      name: attribute.name.trim(),
      displayType: attribute.displayType,
      status: attribute.status,
    };

    initialValueByIdRef.current = new Map(
      (attribute.values ?? []).map((v) => [
        v.id,
        {
          value: v.value.trim(),
          image: (v.image ?? '').trim(),
        },
      ]),
    );

    const rowsFromServer =
      attribute.values?.map((v) => ({
        code: v.code,
        value: v.value,
        image: v.image ?? '',
        _valueId: v.id,
      })) ?? [];

    reset({
      code: attribute.code,
      name: attribute.name,
      displayType: attribute.displayType,
      status: attribute.status,
      values: rowsFromServer.length ? [...rowsFromServer, createEmptyProductAttributeValueRow()] : [createEmptyProductAttributeValueRow()],
    });
  }, [attribute, reset]);

  const onSubmit: SubmitHandler<ProductAttributeFormValues> = async (values) => {
    if (!attributeId) return;
    setLoading(true);
    try {
      const valueRows = values.values ?? [];
      const initialMeta = initialAttributeMetaRef.current;

      const attributePatch: Partial<AttributeRequestDto> = {
        isVariantAxis: true,
      };
      if (initialMeta) {
        if (values.name.trim() !== initialMeta.name) attributePatch.name = values.name.trim();
        if (values.displayType !== initialMeta.displayType) attributePatch.displayType = values.displayType;
        if (values.status !== initialMeta.status) attributePatch.status = values.status;
      } else {
        attributePatch.name = values.name.trim();
        attributePatch.displayType = values.displayType;
        attributePatch.status = values.status;
      }

      await attributeApi.patchAttribute(attributeId, attributePatch);

      const filledRows = valueRows.filter((row) => row.code.trim() && row.value.trim());
      const keptValueIds = new Set(filledRows.map((r) => r._valueId).filter((id): id is string => Boolean(id?.trim())));
      for (const id of initialValueByIdRef.current.keys()) {
        if (!keptValueIds.has(id)) {
          await attributeApi.deleteAttributeValue(attributeId, id);
        }
      }

      for (const row of filledRows) {
        const codeKey = row.code.trim();
        const existingId = row._valueId;

        let imageForApi: string | undefined;
        if (row.image instanceof File) {
          const { asset } = await uploadSingleImage({ file: row.image, visibility: MediaVisibility.PUBLIC });
          imageForApi = asset.publicUrl;
        } else if (typeof row.image === 'string' && row.image.trim()) {
          imageForApi = row.image.trim();
        }

        if (existingId) {
          const baseline = initialValueByIdRef.current.get(existingId);
          const unchanged = baseline !== undefined && baseline.value === row.value.trim() && baseline.image === (imageForApi ?? '');
          if (unchanged) continue;

          await attributeApi.patchAttributeValue(attributeId, existingId, {
            value: row.value,
            ...(imageForApi ? { image: imageForApi } : {}),
          });
        } else {
          await attributeApi.postAttributeValue(attributeId, {
            code: codeKey,
            value: row.value,
            ...(imageForApi ? { image: imageForApi } : {}),
          });
        }
      }
      showSnackbar({ message: 'Cập nhật thuộc tính thành công', type: SnackbarType.SUCCESS });
      navigate(ROUTE_PATH.PRODUCT_ATTRIBUTE_LIST);
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = useCallback(
    (event?: BaseSyntheticEvent) => {
      void handleSubmit(onSubmit)(event);
    },
    [handleSubmit, onSubmit],
  );

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <Stack sx={{ flex: 1, minHeight: 0, gap: 0 }}>
        <LabelFormPageHeader
          title="Chỉnh sửa thuộc tính"
          onBack={() => void navigate(ROUTE_PATH.PRODUCT_ATTRIBUTE_LIST)}
          onCancel={() => void navigate(ROUTE_PATH.PRODUCT_ATTRIBUTE_LIST)}
          onSave={() => void handleFormSubmit()}
          loading={loading}
          disabled={loading || !isDirty}
          cancelPermission={productAttributesButtonPermission('edit_cancel', 'Hủy chỉnh sửa thuộc tính sản phẩm', 'api_attribute_update')}
          savePermission={productAttributesButtonPermission('edit', 'Lưu thuộc tính', 'api_attribute_update')}
        />
        {isLoading ? (
          <LoadingComponent />
        ) : (
          <StackRow sx={{ flex: 1, minHeight: 0, alignItems: 'stretch', p: 3 }}>
            <Stack
              sx={{
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                bgcolor: '#FFFFFF',
                p: 2,
                gap: 3,
                flex: 1,
              }}
            >
              <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Thông tin chung</Typography>

              <Stack
                component="form"
                noValidate
                onSubmit={(event) => {
                  void handleFormSubmit(event);
                }}
              >
                <StackRowAlignCenter gap={3}>
                  <Controller
                    name="code"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextInput
                        label="Mã thuộc tính"
                        placeholder="VD: ATTR_COLOR"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        error={Boolean(fieldState.error)}
                        errorMessage={fieldState.error?.message}
                        disabled
                      />
                    )}
                  />
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextInput
                        requiredMark
                        label="Tên thuộc tính"
                        placeholder="VD: Màu sắc"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        error={Boolean(fieldState.error)}
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                </StackRowAlignCenter>
                <StackRowAlignCenter gap={3}>
                  <Controller
                    name="displayType"
                    control={control}
                    render={({ field, fieldState }) => (
                      <SelectInput
                        requiredMark
                        label="Dạng dữ liệu"
                        placeholder="Vui lòng chọn dữ liệu"
                        options={[...PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS]}
                        name={field.name}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        error={Boolean(fieldState.error)}
                        errorMessage={fieldState.error?.message}
                        fullWidth
                        size="small"
                      />
                    )}
                  />
                  <Controller
                    name="status"
                    control={control}
                    render={({ field, fieldState }) => (
                      <SelectInput
                        requiredMark
                        label="Trạng thái"
                        placeholder="Chọn trạng thái"
                        options={[
                          { value: AttributeStatus.ACTIVE, label: 'Kích hoạt' },
                          { value: AttributeStatus.INACTIVE, label: 'Vô hiệu hóa' },
                        ]}
                        name={field.name}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        error={Boolean(fieldState.error)}
                        errorMessage={fieldState.error?.message}
                        fullWidth
                        size="small"
                      />
                    )}
                  />
                </StackRowAlignCenter>

                <ProductAttributeValuesList control={control} getValues={getValues} dataType={displayType} isValueCodeDisabled={(code) => initialPersistedValueCodesRef.current.has(code.trim())} />
              </Stack>
            </Stack>
          </StackRow>
        )}
      </Stack>
    </Stack>
  );
};

export default ProductAttributeUpdatePage;
