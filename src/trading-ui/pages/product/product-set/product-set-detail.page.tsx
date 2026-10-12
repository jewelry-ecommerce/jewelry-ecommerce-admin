import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import { Stars02 } from '@untitledui/icons';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { type ProductSetItem, type ProductSetItemVariationsResponse, productSetApi } from '../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../common/utils';
import { CustomButton } from '../../../components/button';
import { DataTable, DataTableContentCard, type DataTableColumn } from '../../../components/data-table';
import { EmptyComponent } from '../../../components/empty/empty.component';
import { ItemRowImageCell } from '../../../components/item-row-image/item-row-image-cell.component';
import { ItemRowInfoCell } from '../../../components/item-row-info/item-row-info-cell.component';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { ServerSafeContent } from '../../../components/server-safe-content';
import { StackAlignJustCenter, StackBgDefaultBorRadLayCol, StackRowAlignCenter, StackRowAlignCenterJustBetween, StackRowWrap } from '../../../components/styled';
import { TagCommonComponent } from '../../../components/tag';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import { LabelFormPageHeader } from '../../content-display/label/components';
import { AttributeInfoField } from '../product-attribute/product-attribute-detail/product-attribute-detail.page';
import { ProductSpuSectionPanel } from '../product-spu/components/product-spu-page-sections.component';

export const ProductSetDetailPage = () => {
  const navigate = useNavigate();
  const { setId } = useParams<{ setId: string }>();
  const { palette } = useTheme();
  const {
    data: detail,
    isLoading,
    error,
  } = useSWR(setId ? ['product/admin/product-sets', setId] : null, () => (setId ? productSetApi.getAdminProductSetDetail(setId) : null), {
    revalidateOnFocus: false,
  });
  const setItemIds = useMemo(() => detail?.items.map((item) => item.id) ?? [], [detail?.items]);
  const {
    data: itemVariationResponses,
    isLoading: isLoadingItemVariations,
    error: itemVariationsError,
  } = useSWR(
    setId && setItemIds.length ? ['product/admin/product-set-item-variations', setId, ...setItemIds] : null,
    async () => {
      if (!setId) return [];
      return Promise.all(setItemIds.map((itemId) => productSetApi.getAdminProductSetItemVariations(setId, itemId)));
    },
    { revalidateOnFocus: false },
  );
  const variationsByItemId = useMemo(
    () => new Map<string, ProductSetItemVariationsResponse>((itemVariationResponses ?? []).map((response) => [response.setItemId, response])),
    [itemVariationResponses],
  );
  const orderedItems = useMemo(
    () =>
      [...(detail?.items ?? [])].sort((left, right) => {
        if (left.isKey !== right.isKey) return left.isKey ? -1 : 1;
        return left.sortOrder - right.sortOrder;
      }),
    [detail?.items],
  );

  const goBackToList = useCallback(() => navigate(ROUTE_PATH.PRODUCT_SET_LIST), [navigate]);
  const columns = useMemo<DataTableColumn<ProductSetItem>[]>(
    () => [
      {
        id: 'product',
        label: 'Sản phẩm',
        width: 360,
        renderCell: (item) => (
          <Stack gap={1}>
            {item.isKey ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  width: 'fit-content',
                  borderRadius: STYLE.BORDER_RADIUS_ELEMENT_TAG,
                  backgroundColor: '#ececfe',
                  px: 0.75,
                  py: 0.5,
                }}
              >
                <Stars02 size={16} color="#6762bc" />
                <Typography sx={{ color: '#6762bc', ...TYPOGRAPHY_STYLES.sm.semibold }}>Chữ ký độc quyền</Typography>
              </Box>
            ) : null}
            <StackRowAlignCenter gap={1}>
              <ItemRowImageCell itemId={item.product?.id ?? item.productId} itemName={item.product?.name} thumbnailUrl={item.product?.image} />
              <Stack gap={0.25}>
                <Typography sx={TYPOGRAPHY_STYLES.base.medium}>{item.product?.name ?? '—'}</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: palette.text.disabled }}>{item.product?.spuCode}</Typography>
              </Stack>
            </StackRowAlignCenter>
          </Stack>
        ),
      },
      {
        id: 'quantity',
        label: 'Số lượng',
        width: 100,
        align: 'center',
        renderCell: (item) => item?.quantity,
      },
      {
        id: 'variations',
        label: 'Biến thể áp dụng',
        width: 740,
        renderCell: (item) => {
          const itemVariations = variationsByItemId.get(item.id);
          if (!itemVariations && isLoadingItemVariations) {
            return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: palette.text.secondary }}>Đang tải danh sách SKU...</Typography>;
          }
          if (!itemVariations && itemVariationsError) {
            return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: palette.error.main }}>Không thể tải danh sách SKU.</Typography>;
          }
          if (!itemVariations?.allowedVariations.length) {
            return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: palette.text.secondary }}>Chưa có SKU áp dụng</Typography>;
          }
          return (
            <Stack divider={<Divider flexItem />} gap={1}>
              {itemVariations.allowedVariations.map((variation) => (
                <StackRowAlignCenter key={variation.variationId} gap={2}>
                  <ItemRowInfoCell
                    itemId={variation.variationId}
                    itemName={variation.name ?? itemVariations.productName ?? '—'}
                    thumbnailUrl={variation.image ?? undefined}
                    subtitle={variation.skuCode ?? variation.variationId}
                    variant="default"
                  />
                  <StackRowWrap gap={1} justifyContent="flex-end">
                    {variation.attributes.map((attribute) => (
                      <TagCommonComponent key={attribute.valueId} content={`${attribute.attributeName}: ${attribute.value}`} border />
                    ))}
                  </StackRowWrap>
                </StackRowAlignCenter>
              ))}
            </Stack>
          );
        },
      },
    ],
    [isLoadingItemVariations, itemVariationsError, palette, variationsByItemId],
  );

  if (isLoading) {
    return (
      <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)` }}>
        <LabelFormPageHeader variant="backOnly" onBack={goBackToList} />
        <StackAlignJustCenter sx={{ flex: 1 }}>
          <LoadingComponent />
        </StackAlignJustCenter>
      </Stack>
    );
  }

  if (error || !detail) {
    return (
      <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)` }}>
        <LabelFormPageHeader variant="backOnly" onBack={goBackToList} />
        <StackAlignJustCenter sx={{ flex: 1 }}>
          <EmptyComponent />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: palette.text.secondary }}>{error ? getErrorMessage(error) : 'Không tìm thấy thông tin bộ sản phẩm.'}</Typography>
          <CustomButton variant="outline" onClick={goBackToList}>
            Quay lại danh sách
          </CustomButton>
        </StackAlignJustCenter>
      </Stack>
    );
  }

  const productCount = detail.items?.length ?? detail.productCount ?? 0;

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, minHeight: 0 }}>
      <LabelFormPageHeader variant="backOnly" onBack={goBackToList} />
      <StackBgDefaultBorRadLayCol sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }} gap={3}>
        <ProductSpuSectionPanel title="Thông tin bộ sản phẩm">
          <Stack gap={2}>
            <StackRowAlignCenterJustBetween gap={3}>
              <AttributeInfoField label="Tên bộ sản phẩm">
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: palette.text.primary }}>{detail.name}</Typography>
              </AttributeInfoField>
              <AttributeInfoField label="Mã Set">
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: palette.text.primary }}>{detail.code}</Typography>
              </AttributeInfoField>
            </StackRowAlignCenterJustBetween>
            <StackRowAlignCenterJustBetween gap={3}>
              <AttributeInfoField label="Ngày tạo">
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: palette.text.primary }}>{detail.createdAt ? dayjs(detail.createdAt).format('DD/MM/YYYY HH:mm:ss') : '—'}</Typography>
              </AttributeInfoField>
              <AttributeInfoField label="Số sản phẩm">
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: palette.text.primary }}>{productCount}</Typography>
              </AttributeInfoField>
            </StackRowAlignCenterJustBetween>
          </Stack>
        </ProductSpuSectionPanel>

        {detail.shortDescriptions?.length ? (
          <ProductSpuSectionPanel title="Mô tả ngắn">
            <Stack divider={<Divider flexItem />} gap={2}>
              {detail.shortDescriptions.map((shortDescription) => (
                <Stack key={shortDescription.title} gap={1}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: palette.text.primary }}>{shortDescription.title}</Typography>
                  <ServerSafeContent rawHtml={shortDescription.content} className="ck-content" sx={{ color: palette.text.secondary }} />
                </Stack>
              ))}
            </Stack>
          </ProductSpuSectionPanel>
        ) : null}

        <ProductSpuSectionPanel title="Sản phẩm thành phần">
          <DataTableContentCard>
            <DataTable rows={orderedItems} columns={columns} getRowId={(item) => item.id} emptyTitle="Không có sản phẩm thành phần" />
          </DataTableContentCard>
        </ProductSpuSectionPanel>
      </StackBgDefaultBorRadLayCol>
    </Stack>
  );
};

export default ProductSetDetailPage;
