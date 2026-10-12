import { Box, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import { useMemo, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { ButtonIconContentComponent } from '../../../../components/button';
import { productAttributesButtonPermission } from '../../product-permission.constants';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { LabelFormPageHeader } from '../../../content-display/label/components';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled/stack.style';
import { getProductAttributeUpdatePath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS } from '../product-attribute.constant';
import { Edit02 } from '@untitledui/icons';
import { EmptyComponent } from '../../../../components/empty/empty.component';
import { attributeApi } from '../../../../apis';
import { AttributeStatus } from '../../../../apis/attribute/attribute.enum';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { TagCommonComponent } from '../../../../components/tag';

const getAttributeStatusLabelVi = (status?: AttributeStatus): string => {
  if (status === AttributeStatus.ACTIVE) return 'Kích hoạt';
  if (status === AttributeStatus.INACTIVE) return 'Vô hiệu hóa';
  return '';
};

export const AttributeInfoField = ({ label, children, sx, required = false }: { label: string; children: ReactNode; sx?: SxProps<Theme>; required?: boolean }) => {
  return (
    <Stack sx={{ flex: 1, ...sx }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#27272A' }}>
        {label}
        {required ? (
          <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
            *
          </Box>
        ) : (
          ''
        )}
      </Typography>
      <Typography component="div" sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#27272A' }}>
        {children}
      </Typography>
    </Stack>
  );
};

const ValueListFieldLabel = ({ children }: { children: ReactNode }) => {
  return <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#808089' }}>{children}</Typography>;
};

const ValueListFieldValue = ({ children }: { children: ReactNode }) => {
  return <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#050505' }}>{children}</Typography>;
};

const ProductAttributeDetailPage = () => {
  // hook
  const navigate = useNavigate();
  const { attributeId } = useParams<{ attributeId: string }>();

  // function
  const { data: attribute, isLoading } = useSWR(attributeId ? ['product/admin/attributes/detail', attributeId] : null, () => attributeApi.getAttributeDetail(attributeId!), {
    revalidateOnFocus: false,
  });

  const typeLabel = useMemo(() => (attribute ? (PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS.find((o) => o.value === attribute.displayType)?.label ?? attribute.displayType) : '—'), [attribute]);

  if (!attributeId || !attribute) {
    return <EmptyComponent />;
  }

  if (isLoading && !attribute) {
    return <LoadingComponent />;
  }

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
        bgcolor: '#F9FAFB',
        gap: 0,
      }}
    >
      <LabelFormPageHeader variant="backOnly" onBack={() => navigate(ROUTE_PATH.PRODUCT_ATTRIBUTE_LIST)} />

      <StackRowAlignCenterJustBetween sx={{ px: 3, py: 2, gap: 1.5, backgroundColor: '#FFFFFF' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>{attribute.name}</Typography>
        <ButtonIconContentComponent
          content="Chỉnh sửa"
          icon={<Edit02 size={20} color="#737373" />}
          onClick={() => navigate(getProductAttributeUpdatePath(attributeId))}
          {...productAttributesButtonPermission('edit', 'Chỉnh sửa thuộc tính', 'api_attribute_update')}
          sx={{ color: '#101828', border: '1px solid #111827', padding: '6px 12px' }}
        />
      </StackRowAlignCenterJustBetween>

      <Stack sx={{ p: 3 }}>
        <Stack sx={{ gap: 2 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Thông tin chung</Typography>
          <StackRowAlignCenterJustBetween gap={2}>
            <AttributeInfoField label="Mã thuộc tính">{attribute.code}</AttributeInfoField>
            <AttributeInfoField label="Tên thuộc tính">{attribute.name}</AttributeInfoField>
          </StackRowAlignCenterJustBetween>
          <StackRowAlignCenterJustBetween gap={2}>
            <AttributeInfoField label="Dạng dữ liệu">{typeLabel}</AttributeInfoField>
            <AttributeInfoField label="Trạng thái">
              {' '}
              <TagCommonComponent content={getAttributeStatusLabelVi(attribute.status)} border />
            </AttributeInfoField>
          </StackRowAlignCenterJustBetween>
        </Stack>

        <Stack sx={{ gap: 2, mt: 3 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#6B7280' }}>Danh sách giá trị</Typography>
          {(attribute.values ?? []).length === 0 ? (
            <EmptyComponent />
          ) : (
            <Stack sx={{ gap: 2, maxHeight: 400, overflowY: 'auto' }}>
              {(attribute.values ?? []).map((v) => (
                <StackRowAlignCenter key={v.id} sx={{ width: 'fit-content', gap: 2, alignItems: 'flex-start' }}>
                  <Stack sx={{ width: '112px', borderRight: '1px solid #E5E7EB' }}>
                    <ValueListFieldLabel>Mã giá trị</ValueListFieldLabel>
                    <ValueListFieldValue>{v.code}</ValueListFieldValue>
                  </Stack>
                  <Stack sx={{ flex: 1, minWidth: 160 }}>
                    <ValueListFieldLabel>Tên giá trị</ValueListFieldLabel>
                    <ValueListFieldValue>{v.value}</ValueListFieldValue>
                  </Stack>
                  {v.image ? <Box component="img" src={v.image} alt="" sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, border: '1px solid #E5E7EB' }} /> : null}
                </StackRowAlignCenter>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ProductAttributeDetailPage;
