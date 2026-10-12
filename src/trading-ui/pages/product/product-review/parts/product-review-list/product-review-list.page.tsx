import { STYLE } from '@/trading-ui/adapters/library';
import { Box, Stack, Typography } from '@mui/material';
import { WrapperComponent } from '../../../../../components/wrapper';
import { DataTableStatusTabs, DataTableToolbar, type DataTableToolbarAction } from '../../../../../components/data-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isJavaBackend } from '@/common/config/app.config';
import { recordJavaCapabilityGap } from '@/apis/java/java-capability-gaps';
import { createSharedTimeFilterToolbarAction } from '../../../../../components/time-filter/shared-time-filter';
import { CheckCircleBroken, Send01, XCircle } from '@untitledui/icons';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../../components/button';
import { PRODUCT_REVIEWS_PAGE_SCOPE } from '../../../product-permission.constants';
import { useListPageViewAccess } from '../../../../../permissions/use-list-page-view-access.hook';
import { CheckboxComponent } from '../../../../../components/check-box/check-box.element';
import { StackRowAlignCenter } from '../../../../../components/styled';
import { ProductReviewCard } from '../../components/product-review-card.component';
import { MOCK_PRODUCT_REVIEWS, PRODUCT_REVIEW_STATUS_TABS } from '../../product-review.constant';
import { EmptyComponent } from '../../../../../components/empty/empty.component';
import { ProductReviewApproveDialog } from '../../components/product-review-approve-dialog.component';
import { ProductReviewRejectDialog } from '../../components/product-review-reject-dialog.component';
import { ProductReviewReplyDialog } from '../../components/product-review-reply-dialog.component';
import { ProductReviewStatus } from '../../product-review.interface';

export const ProductReviewListPage = () => {
  const canViewList = useListPageViewAccess(PRODUCT_REVIEWS_PAGE_SCOPE, { listApiCode: 'api_product_review_list' });
  const [activeTab, setActiveTab] = useState<ProductReviewStatus>(ProductReviewStatus.PENDING);
  const [searchValue, setSearchValue] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog States
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState<{ data: string[]; toggle: boolean }>({
    data: [],
    toggle: false,
  });
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<{ data: string[]; toggle: boolean }>({
    data: [],
    toggle: false,
  });
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState<{ data: string[]; toggle: boolean }>({
    data: [],
    toggle: false,
  });

  const filteredReviews = useMemo(() => {
    return isJavaBackend() ? [] : MOCK_PRODUCT_REVIEWS.filter((r) => r.status === activeTab);
  }, [activeTab]);
  useEffect(() => {
    if (isJavaBackend()) recordJavaCapabilityGap('CONTRACT', 'Product review list/moderation API chưa được tích hợp');
  }, []);
  const statusTabs = PRODUCT_REVIEW_STATUS_TABS.map(tab => ({ ...tab, count: isJavaBackend() ? undefined : tab.count }));

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        ...createSharedTimeFilterToolbarAction({
          selectedTimeLabel: 'Thời gian',
          onSelectCustom: () => undefined,
          onSelectPreset: () => {},
        }),
      },
    ],
    [],
  );

  const handleToggleAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(filteredReviews.map((r) => r.id));
      } else {
        setSelectedIds([]);
      }
    },
    [filteredReviews],
  );

  const handleToggleRow = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  }, []);

  const openApprove = (ids: string[]) => {
    setIsApproveDialogOpen({ data: ids, toggle: true });
  };

  const openReject = (ids: string[]) => {
    setIsRejectDialogOpen({ data: ids, toggle: true });
  };

  const openReply = (ids: string[]) => {
    setIsReplyDialogOpen({ data: ids, toggle: true });
  };

  const isAllSelected = filteredReviews.length > 0 && selectedIds.length === filteredReviews.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredReviews.length;

  if (!canViewList) return null;

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
        bgcolor: '#F9FAFB',
      }}
    >
      <WrapperComponent
        label="Danh sách đánh giá"
        tabs={<DataTableStatusTabs tabs={statusTabs} activeValue={activeTab} onChange={(val) => setActiveTab(val as ProductReviewStatus)} />}
      >
        <Stack gap={2} sx={{ flex: 1, minHeight: 0, p: 3, overflowY: 'auto' }}>
          <Box
            sx={{
              p: '16px',
              border: '1px solid #E5E7EB',
              bgcolor: '#FFFFFF',
              borderRadius: '10px',
            }}
          >
            <DataTableToolbar embedded searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Tìm theo tên trang hoặc URL..." actions={toolbarActions} />
          </Box>

          {activeTab !== ProductReviewStatus.REJECTED && (
            <Box
              sx={{
                p: '16px 12px',
                border: '1px solid #E5E7EB',
                bgcolor: '#FFFFFF',
                borderRadius: '10px',
              }}
            >
              <StackRowAlignCenter gap={2}>
                <StackRowAlignCenter gap={1.5}>
                  <CheckboxComponent size="medium" checked={isAllSelected} indeterminate={isIndeterminate} isSameButton={true} onChange={(_, next) => handleToggleAll(next)} sx={{ p: 0 }} />
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#333333' }}>Chọn tất cả ({selectedIds.length})</Typography>
                </StackRowAlignCenter>

                <Box sx={{ width: '1px', height: 32, bgcolor: '#E5E7EB' }} />

                <StackRowAlignCenter gap={2}>
                  {activeTab === ProductReviewStatus.PENDING ? (
                    <>
                      <CustomButton
                        variant="primary"
                        fullWidth={false}
                        startIcon={<CheckCircleBroken size={18} />}
                        disabled={selectedIds.length === 0}
                        onClick={() => openApprove(selectedIds)}
                        sx={{
                          bgcolor: '#2E90FA',
                          color: '#FFFFFF',
                          borderRadius: '10px',
                          padding: '6px 12px',
                          '&:hover': { bgcolor: '#1570EF' },
                          '&:disabled': { bgcolor: '#D1E9FF', color: '#FFFFFF' },
                        }}
                      >
                        Duyệt
                      </CustomButton>
                      <CustomButton
                        variant="primary"
                        fullWidth={false}
                        startIcon={<XCircle size={18} />}
                        disabled={selectedIds.length === 0}
                        onClick={() => openReject(selectedIds)}
                        sx={{
                          bgcolor: '#F04438',
                          color: '#FFFFFF',
                          borderRadius: '10px',
                          padding: '6px 12px',
                          '&:hover': { bgcolor: '#D92D20' },
                          '&:disabled': { bgcolor: '#FEE4E2', color: '#FFFFFF' },
                        }}
                      >
                        Từ chối duyệt
                      </CustomButton>
                    </>
                  ) : activeTab === ProductReviewStatus.APPROVED ? (
                    <CustomButton
                      variant="outline"
                      fullWidth={false}
                      startIcon={<Send01 size={18} />}
                      disabled={selectedIds.length === 0}
                      onClick={() => openReply(selectedIds)}
                      sx={{
                        color: '#344054',
                        borderColor: '#D0D5DD',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D0D5DD' },
                        '&:disabled': { color: '#98A2B3', borderColor: '#EAECF0' },
                      }}
                    >
                      Trả lời
                    </CustomButton>
                  ) : null}
                </StackRowAlignCenter>
              </StackRowAlignCenter>
            </Box>
          )}

          {filteredReviews.length > 0 ? (
            <Stack gap={2}>
              {filteredReviews.map((review) => (
                <ProductReviewCard
                  key={review.id}
                  {...review}
                  checked={selectedIds.includes(review.id)}
                  onToggleChecked={(checked) => handleToggleRow(review.id, checked)}
                  onApprove={activeTab === ProductReviewStatus.PENDING ? () => openApprove([review.id]) : undefined}
                  onReject={activeTab === ProductReviewStatus.PENDING ? () => openReject([review.id]) : undefined}
                  onReply={activeTab === ProductReviewStatus.APPROVED ? () => openReply([review.id]) : undefined}
                  onViewReason={activeTab === ProductReviewStatus.REJECTED ? () => console.log('View reason', review.id) : undefined}
                />
              ))}
            </Stack>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyComponent />
            </Box>
          )}
        </Stack>
      </WrapperComponent>

      {isApproveDialogOpen.toggle && (
        <ProductReviewApproveDialog
          open={isApproveDialogOpen.toggle}
          count={isApproveDialogOpen.data.length}
          onClose={() => setIsApproveDialogOpen({ data: [], toggle: false })}
          onConfirm={() => {
            console.log('Confirmed Approve for:', isApproveDialogOpen.data);
            setIsApproveDialogOpen({ data: [], toggle: false });
            setSelectedIds([]);
          }}
        />
      )}
      {isRejectDialogOpen.toggle && (
        <ProductReviewRejectDialog
          open={isRejectDialogOpen.toggle}
          count={isRejectDialogOpen.data.length}
          onClose={() => setIsRejectDialogOpen({ data: [], toggle: false })}
          onConfirm={(reason) => {
            console.log('Confirmed Reject for:', isRejectDialogOpen.data, 'Reason:', reason);
            setIsRejectDialogOpen({ data: [], toggle: false });
            setSelectedIds([]);
          }}
        />
      )}
      {isReplyDialogOpen.toggle && (
        <ProductReviewReplyDialog
          open={isReplyDialogOpen.toggle}
          onClose={() => setIsReplyDialogOpen({ data: [], toggle: false })}
          onConfirm={() => {
            setIsReplyDialogOpen({ data: [], toggle: false });
            setSelectedIds([]);
          }}
        />
      )}
    </Stack>
  );
};
