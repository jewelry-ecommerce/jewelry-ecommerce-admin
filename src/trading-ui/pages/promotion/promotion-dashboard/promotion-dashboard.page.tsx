import React from 'react';
import { Stack } from '@mui/material';
import useSWR from 'swr';
import { STYLE } from '@/trading-ui/adapters/library';
import { promotionApi, PublishedPromotionStatus, PromotionDraftStatus } from '../../../apis';
import { WrapperComponent } from '../../../components/wrapper';
import { useListPageViewAccess } from '../../../permissions/use-list-page-view-access.hook';
import { PROMOTION_DASHBOARD_PAGE_SCOPE } from '../promotion-permission.constants';
import { PromotionDashboardOverview } from '../components/promotion-dashboard-overview.component';

const PromotionDashboardPage: React.FC = () => {
  const canViewDashboard = useListPageViewAccess(PROMOTION_DASHBOARD_PAGE_SCOPE, { listApiCode: 'api_promotion_campaigns_list' });
  const { data } = useSWR(
    canViewDashboard ? (['promotion/dashboard-campaign-overview'] as const) : null,
    () =>
      promotionApi.getCampaignOverview({
        page: 1,
        limit: 1,
      }),
    { revalidateOnFocus: false },
  );

  if (!canViewDashboard) return null;

  const total = (data?.meta?.draftCount ?? 0) + (data?.meta?.publishedCount ?? 0);
  const confirmedCount = data?.meta?.statusCounts?.draft?.[PromotionDraftStatus.READY_TO_PUBLISH] ?? 0;
  const draftEditingCount = data?.meta?.statusCounts?.draft?.[PromotionDraftStatus.EDITING] ?? 0;
  const liveCount = data?.meta?.statusCounts?.published?.[PublishedPromotionStatus.ACTIVE] ?? 0;

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <WrapperComponent label="Tổng quan khuyến mãi" sx={{ overflow: 'visible', height: 'auto', minHeight: '100%' }}>
        <Stack sx={{ width: '100%', pb: 3 }}>
          <PromotionDashboardOverview total={total} confirmedCount={confirmedCount} draftEditingCount={draftEditingCount} liveCount={liveCount} />
        </Stack>
      </WrapperComponent>
    </Stack>
  );
};

export default PromotionDashboardPage;
