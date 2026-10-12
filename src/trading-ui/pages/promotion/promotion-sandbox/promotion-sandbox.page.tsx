import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { promotionApi, type PromotionDraft } from '../../../apis';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { useListPageViewAccess } from '../../../permissions/use-list-page-view-access.hook';
import { PROMOTION_SANDBOX_PAGE_SCOPE } from '../promotion-permission.constants';
import { SANDBOX_ELIGIBLE_STATUSES, SANDBOX_HEADER_HEIGHT_PX } from './sandbox.constants';
import { PromotionSandboxLeftPanel } from './components/promotion-sandbox-left-panel.component';
import { SandboxCartColumn } from './components/sandbox-cart-column.component';
import { SandboxResultsSidebar } from './components/sandbox-results-sidebar.component';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';

const RuntimeEvaluateSandboxShell = lazy(async () => {
  const module = await import('../components/promotion-runtime-evaluate-panel/runtime-evaluate-sandbox-shell');
  return { default: module.RuntimeEvaluateSandboxShell };
});

const PromotionSandboxPage = () => {
  const canViewSandbox = useListPageViewAccess(PROMOTION_SANDBOX_PAGE_SCOPE, { listApiCode: 'api_promotion_draft_list' });
  const [sandboxPromotions, setSandboxPromotions] = useState<PromotionDraft[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);

  const fetchSandboxPromotions = useCallback(async () => {
    setLoadingPromotions(true);
    try {
      const response = await promotionApi.getPromotionDraftList({ limit: 100 });
      setSandboxPromotions(response.items.filter((item) => SANDBOX_ELIGIBLE_STATUSES.includes(item.status)));
    } catch {
      setSandboxPromotions([]);
    } finally {
      setLoadingPromotions(false);
    }
  }, []);

  useEffect(() => {
    if (!canViewSandbox) return;
    void fetchSandboxPromotions();
  }, [canViewSandbox, fetchSandboxPromotions]);

  if (!canViewSandbox) return null;

  return (
    <Stack sx={{ gap: 0, height: `calc(100vh - ${SANDBOX_HEADER_HEIGHT_PX}px)`, boxSizing: 'border-box', minHeight: 0, bgcolor: '#F3F4F6' }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828', py: 2, px: 3, borderBottom: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>Giả lập khuyến mãi</Typography>
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        {loadingPromotions ? (
          <LoadingComponent />
        ) : (
          <Suspense fallback={<LoadingComponent />}>
            <RuntimeEvaluateSandboxShell>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: 'minmax(220px, 22%) minmax(0, 1fr) minmax(240px, 24%)' },
                  gap: 1,
                  p: 1,
                  height: '100%',
                }}
              >
                <PromotionSandboxLeftPanel promotions={sandboxPromotions} />
                <Box sx={{ minHeight: 0, height: '100%', overflow: 'hidden' }}>
                  <SandboxCartColumn />
                </Box>
                <Box sx={{ minHeight: 0, height: '100%', overflow: 'hidden' }}>
                  <SandboxResultsSidebar />
                </Box>
              </Box>
            </RuntimeEvaluateSandboxShell>
          </Suspense>
        )}
      </Stack>
    </Stack>
  );
};

export default PromotionSandboxPage;
