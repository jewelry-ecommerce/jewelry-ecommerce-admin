import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, Typography } from '@mui/material';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { StackRowAlignCenter, STYLE } from '@/trading-ui/adapters/library';
import { ROUTE_PATH } from '@/router/route.path';
import { LabelFormPageHeader } from '../../../content-display/label/components/label-form-page-header.component';
import { productAttributesButtonPermission } from '../../product-permission.constants';
import { StackRow } from '../../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { SelectInput, TextInput } from '../../../../components/form';
import { type ProductAttributeFormValues, PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS, createEmptyProductAttributeValueRow, productAttributeCreateFormSchema } from '../product-attribute.constant';
import { ProductAttributeValuesList } from '../components/product-attribute-values-list.part';
import { attributeApi, AttributeDisplayType, AttributeStatus } from '../../../../apis/attribute';
import { MediaVisibility } from '../../../../apis/file';
import { uploadSingleImage } from '../../../../common/utils/image-upload.utils';
import { SnackbarType, useSnackbar } from '../../../../hooks/use-snackbar.hook';
import { getErrorMessage } from '../../../../common/utils';
import { type BaseSyntheticEvent, useCallback, useState } from 'react';

const ProductAttributeCreatePage = () => {
  // hook
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // state
  const [loading, setLoading] = useState(false);

  // function
  const { control, handleSubmit, setValue, getValues } = useForm<ProductAttributeFormValues>({
    resolver: yupResolver(productAttributeCreateFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      code: '',
      name: '',
      displayType: undefined,
      status: AttributeStatus.ACTIVE,
      values: [],
    },
  });
  const dataType = useWatch({ control, name: 'displayType' }) ?? AttributeDisplayType.TEXT;

  const onSubmit: SubmitHandler<ProductAttributeFormValues> = async (values) => {
    setLoading(true);
    try {
      const filledRows = values.values.filter((row) => row.code.trim() && row.value.trim());
      const valuesForApi = await Promise.all(
        filledRows.map(async (row) => {
          let image: string | undefined;
          if (row.image instanceof File) {
            const { asset } = await uploadSingleImage({ file: row.image, visibility: MediaVisibility.PUBLIC });
            image = asset.publicUrl;
          } else if (typeof row.image === 'string' && row.image.trim()) {
            image = row.image.trim();
          }
          return {
            code: row.code,
            value: row.value,
            ...(image ? { image } : {}),
          };
        }),
      );
      await attributeApi.postAttribute({ ...values, values: valuesForApi });
      showSnackbar({ message: 'Tạo thuộc tính thành công', type: SnackbarType.SUCCESS });
      navigate(ROUTE_PATH.ATTRIBUTE_LIST);
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
          title="Tạo thuộc tính"
          onBack={() => navigate(ROUTE_PATH.ATTRIBUTE_LIST)}
          onCancel={() => navigate(ROUTE_PATH.ATTRIBUTE_LIST)}
          onSave={() => void handleFormSubmit()}
          loading={loading}
          cancelPermission={productAttributesButtonPermission('create_cancel', 'Hủy tạo thuộc tính sản phẩm', 'api_attribute_create')}
          savePermission={productAttributesButtonPermission('create', 'Lưu thuộc tính', 'api_attribute_create')}
        />

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
                      requiredMark
                      label="Mã thuộc tính"
                      placeholder="VD: ATTR_COLOR"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      error={Boolean(fieldState.error)}
                      errorMessage={fieldState.error?.message}
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
                      value={field.value}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v);
                        if (v) {
                          setValue('values', [createEmptyProductAttributeValueRow()]);
                        } else {
                          setValue('values', []);
                        }
                      }}
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
                      value={field.value}
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
              <ProductAttributeValuesList control={control} getValues={getValues} dataType={dataType} />
            </Stack>
          </Stack>
        </StackRow>
      </Stack>
    </Stack>
  );
};

export default ProductAttributeCreatePage;
