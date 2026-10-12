import { Alert, Stack } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { STYLE } from '@/trading-ui/adapters/library';
import { badgeApi, BadgeCampaignStatus, type BadgeTemplate } from '../../../../../apis';
import { EmptyComponent } from '../../../../../components/empty/empty.component';
import { LoadingComponent } from '../../../../../components/loading/loading.component';
import { getLabelDisplayUpdatePath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { LabelFormPageHeader } from '../../components';
import { contentLabelDisplayButtonPermission } from '../../../content-permission.constants';
import { LabelDisplayFormView } from '../components/label-display-form-view.component';
import { buildLabelTemplateSelectOptions, getLabelDisplayMaxTemplates, isOutOfStockLabelDisplayType, mapDetailToScopeState, mergeBadgeTemplatesForSelect } from '../label-display.utils';

const SYSTEM_GENERATED_READONLY_MESSAGE = 'Cấu hình được đồng bộ từ Pre-order Campaign, không thể chỉnh sửa thủ công.';

const LabelDisplayDetailPage = () => {
  const { displayId = '' } = useParams<{ displayId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!displayId) {
      void navigate(ROUTE_PATH.LABEL_DISPLAY_LIST, { replace: true });
    }
  }, [displayId, navigate]);

  const detailSwr = useSWR(displayId ? (['badge-flow', 'detail', displayId] as const) : null, () => badgeApi.getDetailBadgeFlow(displayId), {
    revalidateOnFocus: false,
  });

  const detail = detailSwr.data;
  const scopeState = useMemo(() => (detail ? mapDetailToScopeState(detail) : null), [detail]);

  const selectedLabelIds = useMemo(() => (detail?.rules ?? []).map((rule) => rule.template?.id).filter((id): id is string => Boolean(id)), [detail]);

  // View-only: dùng template embed trong detail — không gọi GET /badges.
  const allTemplates = useMemo<BadgeTemplate[]>(() => mergeBadgeTemplatesForSelect([], detail?.rules, selectedLabelIds), [detail?.rules, selectedLabelIds]);

  const selectedTemplates = useMemo(
    () => selectedLabelIds.map((id) => allTemplates.find((template) => template.id === id)).filter((template): template is BadgeTemplate => Boolean(template)),
    [allTemplates, selectedLabelIds],
  );

  const labelSelectOptions = useMemo(() => buildLabelTemplateSelectOptions(allTemplates, selectedLabelIds), [allTemplates, selectedLabelIds]);

  if (!displayId) {
    return <EmptyComponent />;
  }

  if (detailSwr.isLoading && !detail) {
    return <LoadingComponent />;
  }

  if (!detail || !scopeState) {
    return <EmptyComponent />;
  }

  const isOutOfStock = isOutOfStockLabelDisplayType(scopeState.badgeType);
  const maxLabelTemplates = getLabelDisplayMaxTemplates(scopeState.badgeType);
  const isSystemGenerated = detail.isSystemGenerated === true;

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Stack sx={{ height: '100%', minHeight: 0, flex: 1, gap: 0 }}>
          <LabelFormPageHeader
            variant="view"
            title="Xem chi tiết cấu hình Labels"
            onBack={() => navigate(ROUTE_PATH.LABEL_DISPLAY_LIST)}
            onEdit={isSystemGenerated ? undefined : () => navigate(getLabelDisplayUpdatePath(displayId))}
            editPermission={contentLabelDisplayButtonPermission('label_display_edit', 'Chỉnh sửa cấu hình hiển thị label', 'api_cms_page_update')}
            buttonPermission={contentLabelDisplayButtonPermission}
          />

          {isSystemGenerated ? (
            <Alert severity="info" sx={{ mx: 3, mt: 2 }}>
              {SYSTEM_GENERATED_READONLY_MESSAGE}
            </Alert>
          ) : null}

          <LabelDisplayFormView
            viewMode
            campaignName={detail.name ?? ''}
            activeFrom={detail.activeFrom ? dayjs(detail.activeFrom) : null}
            activeTo={detail.activeTo ? dayjs(detail.activeTo) : null}
            campaignStatus={detail.status ?? BadgeCampaignStatus.DRAFT}
            selectedBadgeType={scopeState.badgeType}
            selectedLabelIds={selectedLabelIds}
            labelSelectOptions={labelSelectOptions}
            selectedTemplates={selectedTemplates}
            maxLabelTemplates={maxLabelTemplates}
            isOutOfStock={isOutOfStock}
            scopeAll={scopeState.scope === 'all'}
            scopePromotion={scopeState.scope === 'promotion'}
            scopeCategory={scopeState.scope === 'category'}
            scopeCollection={scopeState.scope === 'collection'}
            scopeProduct={scopeState.scope === 'product'}
            selectedPromotions={scopeState.promotions}
            selectedCategories={scopeState.categories}
            selectedCollections={scopeState.collections}
            selectedProducts={scopeState.products}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LabelDisplayDetailPage;
