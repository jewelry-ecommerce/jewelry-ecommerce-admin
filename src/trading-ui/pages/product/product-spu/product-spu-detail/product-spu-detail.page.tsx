import { Box, Stack, Typography } from '@mui/material';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { STYLE } from '@/trading-ui/adapters/library';
import { ButtonIconContentComponent } from '../../../../components/button';
import { productListButtonPermission } from '../../product-permission.constants';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { LabelFormPageHeader } from '../../../content-display/label/components';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled/stack.style';
import { getProductSpuUpdatePath } from '@/trading-ui/router/route.path';
import { useProductSpuListBackNavigation } from '../utils/product-spu-list-navigation.util';
import { ProductSpuPageSectionsFrame, ProductSpuSectionPanel } from '../components/product-spu-page-sections.component';
import { getProductApprovalStatusLabelVi, getProductLifecycleStatusLabelVi, isPendingCreateApproval, PRODUCT_KIND_OPTIONS, ProductSpuSidebarKey } from '../product-spu.constant';
import { Announcement01, Archive, ClockRewind, Edit02, FolderSearch, InfoCircle, RefreshCcw01, Send01, XClose } from '@untitledui/icons';
import { AttributeInfoField } from '../../product-attribute/product-attribute-detail/product-attribute-detail.page';
import { ProductSpuVariantMatrix } from '../components/product-spu-variant-matrix.component';
import { ProductSpuAudit } from '../components/product-spu-audit.component';
import ProductSpuPackagingRelationsEditor from '../components/product-spu-packaging-relations-editor.component';
import { ProductSpuMixMatchEditor } from '../components/product-spu-mix-match-editor.component';
import { ProductSpuPackagingSkuPanel } from '../components/product-spu-packaging-sku-panel.component';
import { EmptyComponent } from '../../../../components/empty/empty.component';
import { productApi, ProductKind, ProductSpuStatus, PRODUCT_UNIT_OF_MEASURE_OPTIONS } from '../../../../apis';
import { flattenSkuPreviewMatrixForTable, skuPreviewResponseToAttributeDefs, variationMediaUrlsByVariantId } from '../utils/product-spu-sku-matrix-preview.utils';
import { buildAppliedSummariesFromVariantMatrixDetail, selectedAttributeKeysFromProductDetail } from '../utils/product-spu-admin-detail.utils';
import { TagCommonComponent } from '../../../../components/tag/tag-common.component';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { getErrorMessage } from '../../../../common/utils';
import type { ProductSpuPageSection } from '../product-spu.interface';
import { buildProductSpuDetailSwrKey, revalidateProductSpuDetail } from '../utils/product-spu-detail-cache.utils';
import { ProductSpuInfosReadonly } from '../components/product-spu-infos-readonly.component';

const ProductSpuDetailPage = () => {
  const navigate = useNavigate();
  const goBackToList = useProductSpuListBackNavigation();
  const { showSnackbar } = useSnackbar();
  const { spuId } = useParams<{ spuId: string }>();
  const [auditOpen, setAuditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const detailSwr = useSWR(spuId ? buildProductSpuDetailSwrKey(spuId) : null, () => productApi.getAdminProductDetail(spuId!), {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });
  const detail = detailSwr.data;

  const matrixFlatRows = useMemo(
    () =>
      detail?.variantMatrix
        ? flattenSkuPreviewMatrixForTable(detail.variantMatrix, {
            mediaUrlsByVariantId: variationMediaUrlsByVariantId(detail.variations),
          })
        : undefined,
    [detail?.variantMatrix, detail?.variations],
  );

  const matrixAttributeOrder = useMemo(() => (detail?.variantMatrix ? skuPreviewResponseToAttributeDefs(detail.variantMatrix) : []), [detail?.variantMatrix]);

  const appliedSummaries = useMemo(() => (detail ? buildAppliedSummariesFromVariantMatrixDetail(detail) : []), [detail]);

  const selectedKeys = useMemo(() => (detail ? selectedAttributeKeysFromProductDetail(detail) : []), [detail]);

  const canEdit = Boolean(detail && !detail.approval?.hasPending && detail.status !== ProductSpuStatus.ARCHIVED);
  const canPublish = detail?.status === ProductSpuStatus.UNPUBLISHED && !detail?.approval?.hasPending;
  const canDiscontinue = detail?.status === ProductSpuStatus.PUBLISHED && !detail?.approval?.hasPending;
  const canArchive = detail?.status === ProductSpuStatus.PUBLISHED && !detail?.approval?.hasPending;
  const canRestorePublished = detail?.status === ProductSpuStatus.DISCONTINUED && !detail?.approval?.hasPending;
  const canRestoreUnpublished = detail?.status === ProductSpuStatus.ARCHIVED && !detail?.approval?.hasPending;
  const canCancelPending = Boolean(detail?.approval?.hasPending && detail.approval.requestId);

  const goEdit = useCallback(() => {
    if (!spuId || !canEdit) return;
    void navigate(getProductSpuUpdatePath(spuId));
  }, [canEdit, navigate, spuId]);

  const handlePublish = useCallback(async () => {
    if (!spuId || !canPublish || actionLoading) return;
    setActionLoading(true);
    try {
      await productApi.patchAdminProductStatus(spuId, { status: ProductSpuStatus.PUBLISHED });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã xuất bản sản phẩm.' });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, canPublish, detailSwr, showSnackbar, spuId]);

  const handleArchive = useCallback(async () => {
    if (!spuId || !canArchive || actionLoading) return;
    setActionLoading(true);
    try {
      await productApi.patchAdminProductStatus(spuId, { status: ProductSpuStatus.ARCHIVED });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã lưu trữ sản phẩm.' });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, canArchive, detailSwr, showSnackbar, spuId]);

  const handleDiscontinue = useCallback(async () => {
    if (!spuId || !canDiscontinue || actionLoading) return;
    setActionLoading(true);
    try {
      await productApi.patchAdminProductStatus(spuId, { status: ProductSpuStatus.DISCONTINUED });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã chuyển sản phẩm sang ngừng kinh doanh.' });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, canDiscontinue, detailSwr, showSnackbar, spuId]);

  const handleRestorePublished = useCallback(async () => {
    if (!spuId || !canRestorePublished || actionLoading) return;
    setActionLoading(true);
    try {
      await productApi.patchAdminProductStatus(spuId, { status: ProductSpuStatus.PUBLISHED });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã khôi phục kinh doanh sản phẩm.' });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, canRestorePublished, detailSwr, showSnackbar, spuId]);

  const handleRestoreUnpublished = useCallback(async () => {
    if (!spuId || !canRestoreUnpublished || actionLoading) return;
    setActionLoading(true);
    try {
      await productApi.patchAdminProductStatus(spuId, { status: ProductSpuStatus.UNPUBLISHED });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã khôi phục sản phẩm (chưa xuất bản).' });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, canRestoreUnpublished, detailSwr, showSnackbar, spuId]);

  const handleCancelPending = useCallback(async () => {
    if (!spuId || !detail?.approval?.requestId || actionLoading) return;
    setActionLoading(true);
    try {
      await productApi.postAdminProductApprovalCancel(detail.approval.requestId);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã hủy yêu cầu duyệt.' });
      await revalidateProductSpuDetail(spuId);
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, detail?.approval?.requestId, detailSwr, showSnackbar]);

  const sectionBlocks = useMemo((): ProductSpuPageSection[] => {
    if (!detail) return [];

    const isPackagingProduct = detail.productKind === ProductKind.PACKAGING || detail.productKind === ProductKind.SHIPPING_PACKAGING;

    const blocks: Array<ProductSpuPageSection | null> = [
      {
        key: ProductSpuSidebarKey.GENERAL,
        content: (
          <ProductSpuSectionPanel title="Thông tin chung" icon={<InfoCircle size={20} color="#737373" />}>
            <Stack gap={2}>
              <StackRowAlignCenterJustBetween>
                <AttributeInfoField sx={{ gap: 0.5 }} label="Mã sản phẩm">
                  {detail.spuCode}
                </AttributeInfoField>
                <AttributeInfoField sx={{ gap: 0.5 }} label="Tên sản phẩm">
                  {detail.name}
                </AttributeInfoField>
              </StackRowAlignCenterJustBetween>
              <StackRowAlignCenterJustBetween>
                <AttributeInfoField sx={{ gap: 0.5 }} label="Loại sản phẩm">
                  {PRODUCT_KIND_OPTIONS.find((item) => item.value === detail.productKind)?.label ?? detail.productKind ?? '—'}
                </AttributeInfoField>
                <AttributeInfoField sx={{ gap: 0.5 }} label="Đơn vị tính">
                  {PRODUCT_UNIT_OF_MEASURE_OPTIONS.find((item) => item.value === detail.unitOfMeasure)?.label ?? detail.unitOfMeasure ?? '—'}
                </AttributeInfoField>
              </StackRowAlignCenterJustBetween>
              {isPackagingProduct ? null : (
                <StackRowAlignCenterJustBetween>
                  <AttributeInfoField sx={{ gap: 0.5 }} label="Danh mục">
                    {detail.category?.name ?? '—'}
                  </AttributeInfoField>
                  <AttributeInfoField sx={{ gap: 0.5 }} label="Mùa">
                    {detail.season?.name ?? '—'}
                  </AttributeInfoField>
                </StackRowAlignCenterJustBetween>
              )}
              <StackRowAlignCenterJustBetween>
                <AttributeInfoField sx={{ gap: 0.5 }} label="Trạng thái sản phẩm">
                  <TagCommonComponent content={getProductLifecycleStatusLabelVi(detail.status)} />
                </AttributeInfoField>
                <AttributeInfoField sx={{ gap: 0.5 }} label="Trạng thái duyệt">
                  <TagCommonComponent content={getProductApprovalStatusLabelVi(detail.approval, detail.status)} />
                </AttributeInfoField>
              </StackRowAlignCenterJustBetween>
              {detail.approval?.rejectedReason ? (
                <AttributeInfoField sx={{ gap: 0.5 }} label="Lý do từ chối">
                  {detail.approval.rejectedReason}
                </AttributeInfoField>
              ) : null}
              {isPackagingProduct ? null : <ProductSpuInfosReadonly productInfos={detail.productInfos} />}
            </Stack>
          </ProductSpuSectionPanel>
        ),
      },
      isPackagingProduct
        ? {
            key: ProductSpuSidebarKey.VARIANTS,
            content: (
              <ProductSpuSectionPanel title="Biến thể bao bì" icon={<Archive size={20} color="#737373" />}>
                <ProductSpuPackagingSkuPanel detail={detail} />
              </ProductSpuSectionPanel>
            ),
          }
        : {
            key: ProductSpuSidebarKey.VARIANTS,
            content: (
              <ProductSpuSectionPanel title="Biến thể và tồn kho" icon={<Archive size={20} color="#737373" />}>
                <Stack>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#6B7280' }}>Thuộc tính</Typography>
                  <ProductSpuVariantMatrix
                    readOnly
                    appliedAttributeSummaries={appliedSummaries}
                    attributeOrder={matrixAttributeOrder}
                    keyRows={[]}
                    attributeTreeOptions={[]}
                    selectedAttributes={selectedKeys}
                    onSelectedAttributesChange={() => {}}
                    skuMatrixPreviewFlatRows={matrixFlatRows}
                  />
                </Stack>
              </ProductSpuSectionPanel>
            ),
          },

      isPackagingProduct
        ? null
        : {
            key: ProductSpuSidebarKey.PACKAGING,
            content: (
              <ProductSpuSectionPanel title="Bao bì/ hộp đựng đi kèm" icon={<Archive size={20} color="#737373" />}>
                <ProductSpuPackagingRelationsEditor readOnly productKind={detail.productKind} relations={detail.packagingRelations ?? []} />
              </ProductSpuSectionPanel>
            ),
          },
      isPackagingProduct
        ? null
        : {
            key: ProductSpuSidebarKey.MARKETING,
            content: (
              <ProductSpuSectionPanel title="Marketing & Loyalty" icon={<Announcement01 size={20} color="#737373" />}>
                <Stack gap={1.5}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#344054' }}>Sản phẩm mua kèm (Cross - Sell)</Typography>
                  <ProductSpuMixMatchEditor readOnly value={(detail.productMixMatch ?? []).map((item) => item.id)} resolvedItems={detail.productMixMatch} excludeProductId={detail.id} />
                </Stack>
              </ProductSpuSectionPanel>
            ),
          },
      isPackagingProduct
        ? null
        : {
            key: ProductSpuSidebarKey.SEO,
            content: (
              <ProductSpuSectionPanel title="Cấu hình SEO" icon={<FolderSearch size={20} color="#737373" />}>
                <Stack>
                  <StackRowAlignCenterJustBetween>
                    <AttributeInfoField sx={{ gap: 0.5 }} label="Tiêu đề SEO">
                      {detail.metaTitle?.trim() || '—'}
                    </AttributeInfoField>
                    <AttributeInfoField sx={{ gap: 0.5 }} label="Từ khóa SEO">
                      {detail.metaKeywords?.trim() || '—'}
                    </AttributeInfoField>
                  </StackRowAlignCenterJustBetween>
                  <AttributeInfoField sx={{ gap: 0.5 }} label="Mô tả SEO">
                    {detail.metaDescription?.trim() || '—'}
                  </AttributeInfoField>
                </Stack>
              </ProductSpuSectionPanel>
            ),
          },
    ];

    return blocks.filter((block): block is ProductSpuPageSection => Boolean(block));
  }, [appliedSummaries, detail, matrixAttributeOrder, matrixFlatRows, selectedKeys]);

  return !spuId || (detailSwr.error && !detail) ? (
    <EmptyComponent />
  ) : detailSwr.isLoading && !detail ? (
    <LoadingComponent size="large" />
  ) : (
    <Fragment>
      <Stack
        sx={{
          height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
          boxSizing: 'border-box',
          minHeight: 0,
          bgcolor: '#F9FAFB',
          gap: 0,
        }}
      >
        <LabelFormPageHeader variant="backOnly" onBack={goBackToList} />
        <StackRowAlignCenterJustBetween sx={{ px: 3, py: 2, gap: 1.5, backgroundColor: '#FFFFFF' }}>
          <Box>
            <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>{detail?.name}</Typography>
            <StackRowAlignCenter gap={1}>
              <TagCommonComponent border content={getProductLifecycleStatusLabelVi(detail?.status ?? ProductSpuStatus.DRAFT)} />
              <TagCommonComponent content={getProductApprovalStatusLabelVi(detail?.approval, detail?.status)} />
            </StackRowAlignCenter>
          </Box>
          <StackRowAlignCenter gap={1}>
            <ButtonIconContentComponent
              content="Lịch sử chỉnh sửa"
              icon={<ClockRewind size={20} color="#000" />}
              onClick={() => setAuditOpen(true)}
              {...productListButtonPermission('view_history', 'Xem lịch sử chỉnh sửa sản phẩm', 'api_product_detail')}
              sx={{
                color: '#101828',
                backgroundColor: '#FAFAFA',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
              }}
            />
            {canPublish ? (
              <ButtonIconContentComponent
                content="Xuất bản"
                icon={<Send01 size={18} color="#101828" />}
                onClick={() => void handlePublish()}
                {...productListButtonPermission('publish', 'Xuất bản sản phẩm', 'api_product_update')}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
            {canDiscontinue ? (
              <ButtonIconContentComponent
                content="Ngừng kinh doanh"
                icon={<XClose size={18} color="#101828" />}
                onClick={() => void handleDiscontinue()}
                {...productListButtonPermission('discontinue', 'Ngừng kinh doanh sản phẩm', 'api_product_update')}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
            {canArchive ? (
              <ButtonIconContentComponent
                content="Lưu trữ"
                icon={<Archive size={18} color="#101828" />}
                onClick={() => void handleArchive()}
                {...productListButtonPermission('archive', 'Lưu trữ sản phẩm', 'api_product_update')}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
            {canRestorePublished ? (
              <ButtonIconContentComponent
                content="Khôi phục kinh doanh"
                icon={<RefreshCcw01 size={18} color="#101828" />}
                onClick={() => void handleRestorePublished()}
                {...productListButtonPermission('restore_published', 'Khôi phục kinh doanh sản phẩm', 'api_product_update')}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
            {canRestoreUnpublished ? (
              <ButtonIconContentComponent
                content="Khôi phục"
                icon={<RefreshCcw01 size={18} color="#101828" />}
                onClick={() => void handleRestoreUnpublished()}
                {...productListButtonPermission('restore', 'Khôi phục sản phẩm', 'api_product_update')}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
            {canCancelPending ? (
              <ButtonIconContentComponent
                content="Hủy yêu cầu"
                icon={<XClose size={18} color="#B42318" />}
                onClick={() => void handleCancelPending()}
                {...productListButtonPermission('cancel_approval', 'Hủy yêu cầu duyệt sản phẩm', 'api_product_submit')}
                sx={{ color: '#B42318', border: '1px solid #B42318', padding: '8px 12px' }}
              />
            ) : null}
            {canEdit ? (
              <ButtonIconContentComponent
                content="Chỉnh sửa"
                icon={<Edit02 size={20} color="#737373" />}
                onClick={goEdit}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
          </StackRowAlignCenter>
        </StackRowAlignCenterJustBetween>

        {isPendingCreateApproval(detail?.approval) ? (
          <Box sx={{ px: 3, py: 2, bgcolor: '#FFFAEB', borderBottom: '1px solid #FDE68A' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#B54708' }}>Sản phẩm đang chờ duyệt tạo mới. Dữ liệu hiện tại vẫn là bản nháp.</Typography>
          </Box>
        ) : null}

        <Box sx={{ flex: 1, minHeight: 0, p: 3, pt: 0 }}>
          <ProductSpuPageSectionsFrame sections={sectionBlocks} scrollAreaMaxHeight="calc(100vh - 220px)" sx={{ pt: 2 }} />
        </Box>
      </Stack>
      <ProductSpuAudit open={auditOpen} productId={spuId} onClose={() => setAuditOpen(false)} />
    </Fragment>
  );
};

export default ProductSpuDetailPage;
