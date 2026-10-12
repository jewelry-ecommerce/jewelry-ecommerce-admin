import React, { Fragment, useCallback, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import { Edit02, Settings01 } from '@untitledui/icons';
import { PromotionDraftStatus, PublishedPromotionStatus, type PromotionDraftSchema, promotionApi } from '../../apis';
import { LoadingComponent } from '../../components/loading/loading.component';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../components/styled';
import { TagCommonComponent } from '../../components/tag';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { getPromotionUpdatePath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { LabelFormPageHeader } from '../content-display/label/components';
import { ProductSpuSectionPanel } from '../product/product-spu/components/product-spu-page-sections.component';
import { PromotionConfigSection } from './components/promotion-config-section.component';
import { PromotionPendingConfigPanel } from './components/promotion-pending-config-panel.component';
import { PromotionPublishPanel } from './components/promotion-publish';
import { PromotionQuotaStatisticsBlock } from './components/promotion-quota-statistics-block.component';
import { PromotionSchemaCard } from './components/promotion-schema-card.component';
import { getPromotionDetailSectionIcon, getPromotionDraftStatusLabel, getPublishedPromotionStatusLabel } from './promotion.constant';
import { DialogConfirmComponent } from '../../components/dialog';
import { getErrorMessage } from '../../common/utils';
import { ButtonIconContentComponent } from '../../components/button';
import { promotionListButtonPermission } from './promotion-permission.constants';
import { ApplicabilityInlineForm } from './components/promotion-applicability';
import { AudienceInlineForm } from './components/promotion-audience';
import { GeneralInfoInlineForm, PromotionDetailSidebar } from './components/promotion-general';
import { TargetInlineForm } from './components/promotion-target';
import { usePromotionDetailData } from './hooks/use-promotion-detail-data.hook';
import { isPromotionDraftEditable } from './utils/promotion-detail.helpers';

const GeneralSectionIcon = getPromotionDetailSectionIcon('general');
const LIFECYCLE_CONFIRM_META = {
  pause: {
    title: 'Tạm dừng chương trình',
    confirmLabel: 'Xác nhận tạm dừng',
    permission: promotionListButtonPermission('pause', 'Xác nhận tạm dừng chương trình khuyến mãi', 'api_promotion_pause'),
  },
  resume: {
    title: 'Kích hoạt lại chương trình',
    confirmLabel: 'Xác nhận kích hoạt',
    permission: promotionListButtonPermission('resume', 'Xác nhận kích hoạt lại chương trình khuyến mãi', 'api_promotion_resume'),
  },
  end: {
    title: 'Kết thúc chương trình',
    confirmLabel: 'Xác nhận kết thúc',
    permission: promotionListButtonPermission('end', 'Xác nhận kết thúc chương trình khuyến mãi', 'api_promotion_end'),
  },
} as const;

const PromotionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const {
    promotionId,
    source,
    promotionDraft,
    promotionPublished,
    schemas,
    schemaComponentsBySchemaId,
    voucherCodesBySchemaId,
    loading,
    activeSection,
    target,
    audience,
    applicability,
    publishReadiness,
    showConfigurationSections,
    name,
    description,
    startsAt,
    endsAt,
    fetchDetail,
    refreshComponents,
    fetchSchemas,
    handleNavigateSection,
    scrollContainerRef,
  } = usePromotionDetailData();

  const [lifecycleLoading, setLifecycleLoading] = useState(false);
  const [lifecycleActionState, setLifecycleActionState] = useState<{ action?: 'pause' | 'resume' | 'end'; toggle: boolean }>({ toggle: false });
  const [schemaUnpublishingId, setSchemaUnpublishingId] = useState<string | null>(null);
  const [schemaUnpublishState, setSchemaUnpublishState] = useState<{ toggle: boolean; schema?: PromotionDraftSchema }>({ toggle: false });

  const isEditable = isPromotionDraftEditable(source, promotionDraft);

  const goEditMode = useCallback(() => {
    if (!promotionId) return;
    navigate(getPromotionUpdatePath(promotionId));
  }, [navigate, promotionId]);

  const handleLifecycleMutation = async () => {
    if (!promotionId || !lifecycleActionState.action) return;
    setLifecycleLoading(true);
    try {
      if (lifecycleActionState.action === 'pause') {
        await promotionApi.pausePublishedPromotion(promotionId);
        showSnackbar({ message: 'Tạm dừng chương trình khuyến mãi thành công', type: SnackbarType.SUCCESS });
      } else if (lifecycleActionState.action === 'resume') {
        await promotionApi.resumePublishedPromotion(promotionId);
        showSnackbar({ message: 'Kích hoạt lại chương trình khuyến mãi thành công', type: SnackbarType.SUCCESS });
      } else if (lifecycleActionState.action === 'end') {
        await promotionApi.endPublishedPromotion(promotionId);
        showSnackbar({ message: 'Kết thúc chương trình khuyến mãi thành công', type: SnackbarType.SUCCESS });
      }
      setLifecycleActionState({ toggle: false });
      await fetchDetail();
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setLifecycleLoading(false);
    }
  };

  const handleUnpublishSchema = useCallback(async () => {
    const schema = schemaUnpublishState.schema;
    if (!promotionId || !schema) return;

    setSchemaUnpublishingId(schema.id);
    try {
      await promotionApi.unpublishPublishedPromotionSchema(promotionId, schema.id);
      setSchemaUnpublishState({ toggle: false });
      await Promise.all([fetchSchemas(), fetchDetail({ silent: true })]);
      showSnackbar({ message: 'Đã dừng hình thức khuyến mãi.', type: SnackbarType.SUCCESS });
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setSchemaUnpublishingId(null);
    }
  }, [fetchDetail, fetchSchemas, promotionId, schemaUnpublishState.schema, showSnackbar]);

  if (loading) return <LoadingComponent size="large" />;

  const statusLabel =
    source === 'published' ? getPublishedPromotionStatusLabel(promotionPublished?.status ?? '') : getPromotionDraftStatusLabel(promotionDraft?.status ?? PromotionDraftStatus.EDITING);
  const statusColor = source === 'published' && promotionPublished?.status === PublishedPromotionStatus.ACTIVE ? 'success' : 'default';

  return (
    <Fragment>
      <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0, bgcolor: '#F9FAFB', gap: 0, overflow: 'hidden' }}>
        <LabelFormPageHeader variant="backOnly" onBack={() => navigate(ROUTE_PATH.PROMOTION)} />

        <StackRowAlignCenterJustBetween sx={{ px: 3, py: 2, gap: 1.5, flexWrap: 'wrap', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>{name}</Typography>
          <StackRowAlignCenter gap={1.5}>
            <TagCommonComponent border content={statusLabel} color={statusColor} />
            {source === 'draft' && isEditable ? (
              <ButtonIconContentComponent
                content="Chỉnh sửa"
                icon={<Edit02 size={20} color="#737373" />}
                onClick={goEditMode}
                {...promotionListButtonPermission('edit', 'Chỉnh sửa chương trình khuyến mãi', 'api_promotion_draft_update')}
                sx={{ color: '#101828', border: '1px solid #111827', padding: '8px 12px' }}
              />
            ) : null}
            {/* {source === 'published' && promotionPublished ? (
              <StackRow gap={1.5}>
                {promotionPublished.status === PublishedPromotionStatus.ACTIVE ? (
                  <ButtonIconContentComponent
                    content="Tạm dừng"
                    icon={<PauseCircle size={20} color="#B54708" />}
                    onClick={() => setLifecycleActionState({ action: 'pause', toggle: true })}
                    disabled={lifecycleLoading}
                    {...promotionListButtonPermission('pause', 'Tạm dừng chương trình khuyến mãi', 'api_promotion_pause')}
                    sx={{ color: '#B54708', border: '1px solid #FDB022', padding: '8px 12px' }}
                  />
                ) : null}
                {promotionPublished.status === PublishedPromotionStatus.PAUSED ? (
                  <ButtonIconContentComponent
                    content="Kích hoạt lại"
                    icon={<PlayCircle size={20} color="#027A48" />}
                    onClick={() => setLifecycleActionState({ action: 'resume', toggle: true })}
                    disabled={lifecycleLoading}
                    {...promotionListButtonPermission('resume', 'Kích hoạt lại chương trình khuyến mãi', 'api_promotion_resume')}
                    sx={{ color: '#027A48', border: '1px solid #6CE9A6', padding: '8px 12px' }}
                  />
                ) : null}
                {[PublishedPromotionStatus.SCHEDULED, PublishedPromotionStatus.ACTIVE, PublishedPromotionStatus.PAUSED].includes(promotionPublished.status) ? (
                  <ButtonIconContentComponent
                    content="Kết thúc"
                    icon={<StopCircle size={20} color="#B42318" />}
                    onClick={() => setLifecycleActionState({ action: 'end', toggle: true })}
                    disabled={lifecycleLoading}
                    {...promotionListButtonPermission('end', 'Kết thúc chương trình khuyến mãi', 'api_promotion_end')}
                    sx={{ color: '#B42318', border: '1px solid #FDA29B', padding: '8px 12px' }}
                  />
                ) : null}
              </StackRow>
            ) : null} */}
          </StackRowAlignCenter>
        </StackRowAlignCenterJustBetween>

        <Box ref={scrollContainerRef} sx={{ flex: 1, minHeight: 0, p: 3, pt: 2, overflowY: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '220px minmax(0, 1fr)' }, gap: 2, alignItems: 'start' }}>
            <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 0 }}>
              <PromotionDetailSidebar activeKey={activeSection} onNavigate={handleNavigateSection} source={source} />
            </Box>
            <Stack sx={{ minWidth: 0, gap: 2, pr: { xs: 0, md: 0.5 } }}>
              <Box id="promotion-section-general">
                <ProductSpuSectionPanel title="Thông tin chung" icon={<GeneralSectionIcon size={20} color="#737373" />}>
                  {promotionDraft ? (
                    <GeneralInfoInlineForm promotion={promotionDraft} editable={false} saving={false} onSave={() => undefined} />
                  ) : (
                    <Stack gap={1.5}>
                      <StackRowAlignCenterJustBetween>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#6B7280' }}>Thời gian áp dụng</Typography>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>
                          {new Date(startsAt).toLocaleString('vi-VN')} - {new Date(endsAt).toLocaleString('vi-VN')}
                        </Typography>
                      </StackRowAlignCenterJustBetween>
                      <StackRowAlignCenterJustBetween>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#6B7280' }}>Mô tả</Typography>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467', textAlign: 'right' }}>{description || '-'}</Typography>
                      </StackRowAlignCenterJustBetween>
                      {source === 'published' && promotionPublished ? (
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Xuất bản: {new Date(promotionPublished.publishedAt).toLocaleString('vi-VN')}</Typography>
                      ) : null}
                    </Stack>
                  )}
                </ProductSpuSectionPanel>
              </Box>

              {showConfigurationSections ? (
                <>
                  {!target?.config ? (
                    <PromotionPendingConfigPanel
                      sectionId="target"
                      title="Sản phẩm áp dụng"
                      description="Vui lòng chọn sản phẩm áp dụng trước khi tạo hình thức khuyến mãi. Mọi hình thức khuyến mãi trong chương trình sẽ dùng chung phạm vi này."
                    />
                  ) : (
                    <Box id="promotion-section-target">
                      <PromotionConfigSection
                        id="target"
                        title="Phạm vi sản phẩm"
                        action={null}
                        isEmpty={false}
                        emptyState={{ icon: <Settings01 size={40} color="#98A2B3" />, title: '', description: '' }}
                      >
                        <TargetInlineForm
                          promotionId={promotionId ?? ''}
                          initialTarget={target.config}
                          initialSkus={target.skus}
                          initialExcludedSkus={target.excludedSkus}
                          editable={false}
                          onSaved={() => refreshComponents()}
                        />
                      </PromotionConfigSection>
                    </Box>
                  )}

                  {!audience?.config ? (
                    <PromotionPendingConfigPanel sectionId="audience" title="Đối tượng khách hàng" description="Vui lòng chọn đối tượng khách hàng áp dụng." />
                  ) : (
                    <Box id="promotion-section-audience">
                      <PromotionConfigSection
                        id="audience"
                        title="Đối tượng khách hàng"
                        action={null}
                        isEmpty={false}
                        emptyState={{ icon: <Settings01 size={40} color="#98A2B3" />, title: '', description: '' }}
                      >
                        <AudienceInlineForm
                          promotionId={promotionId ?? ''}
                          initialAudience={audience.config}
                          initialCustomers={audience.customers}
                          editable={false}
                          onSaved={() => refreshComponents()}
                        />
                      </PromotionConfigSection>
                    </Box>
                  )}

                  {/* Luôn hiển thị: KM cũ không có applicability vẫn phải cho biết
                      nó đang chạy theo mặc định online / mọi cửa hàng. */}
                  <Box id="promotion-section-applicability">
                    <PromotionConfigSection
                      id="applicability"
                      title="Phạm vi áp dụng"
                      action={null}
                      isEmpty={false}
                      emptyState={{ icon: <Settings01 size={40} color="#98A2B3" />, title: '', description: '' }}
                    >
                      <ApplicabilityInlineForm promotionId={promotionId ?? ''} initialApplicability={applicability?.config ?? null} editable={false} onSaved={() => refreshComponents()} />
                    </PromotionConfigSection>
                  </Box>

                  {schemas.length === 0 ? (
                    <PromotionPendingConfigPanel sectionId="schemas" title="Hình thức khuyến mãi" description="Thêm ít nhất một hình thức khuyến mãi để định nghĩa cơ chế ưu đãi và phạm vi áp dụng." />
                  ) : (
                    <Box id="promotion-section-schemas">
                      <PromotionConfigSection
                        id="schemas"
                        title="Hình thức khuyến mãi"
                        action={null}
                        isEmpty={false}
                        emptyState={{ icon: <Settings01 size={40} color="#98A2B3" />, title: '', description: '' }}
                      >
                        <Stack gap={1.5}>
                          {schemas.map((schema) => (
                            <PromotionSchemaCard
                              key={schema.id}
                              schema={schema}
                              schemaComponents={schemaComponentsBySchemaId[schema.id]}
                              voucherCode={voucherCodesBySchemaId[schema.id]}
                              isEditable={false}
                              isFocused={false}
                              isDeleting={false}
                              showUnpublishAction={source === 'published'}
                              isUnpublishing={schemaUnpublishingId === schema.id}
                              onEdit={() => undefined}
                              onDelete={() => undefined}
                              onUnpublish={() => setSchemaUnpublishState({ toggle: true, schema })}
                            />
                          ))}
                        </Stack>
                      </PromotionConfigSection>
                    </Box>
                  )}

                  <PromotionQuotaStatisticsBlock promotionId={promotionId ?? ''} enabled={source === 'published'} />

                  {source === 'draft' && promotionDraft && publishReadiness ? (
                    <Box id="promotion-section-publish">{publishReadiness ? <PromotionPublishPanel readiness={publishReadiness} /> : null}</Box>
                  ) : null}
                </>
              ) : null}
            </Stack>
          </Box>
        </Box>
      </Stack>

      <DialogConfirmComponent
        open={schemaUnpublishState.toggle}
        onClose={() => setSchemaUnpublishState({ toggle: false })}
        title="Dừng hình thức khuyến mãi"
        highlight={{
          tone: 'warning',
          title: schemaUnpublishState.schema ? `Dừng hình thức khuyến mãi "${schemaUnpublishState.schema.name}"?` : '',
          description: 'Hình thức khuyến mãi sẽ dừng ngay lập tức và không còn được áp dụng trên hệ thống.',
        }}
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận dừng"
        loading={schemaUnpublishState.schema ? schemaUnpublishingId === schemaUnpublishState.schema.id : false}
        onCancel={() => setSchemaUnpublishState({ toggle: false })}
        onConfirm={() => void handleUnpublishSchema()}
        confirmButtonProps={promotionListButtonPermission('unpublish_schema', 'Xác nhận dừng hình thức khuyến mãi', [
          'api_promotion_post_promotions_id_schemas_schemaid_unpublish',
          'api_promotion_schema_unpublish',
        ])}
      />

      <DialogConfirmComponent
        open={lifecycleActionState.toggle}
        onClose={() => setLifecycleActionState({ toggle: false })}
        title={lifecycleActionState.action ? LIFECYCLE_CONFIRM_META[lifecycleActionState.action].title : 'Xác nhận'}
        highlight={{
          tone: lifecycleActionState.action === 'end' ? 'danger' : 'warning',
          title: name,
          description:
            lifecycleActionState.action === 'pause'
              ? `Bạn có chắc chắn muốn tạm dừng chương trình khuyến mãi "${name}"? Chương trình sẽ không còn hiệu lực trên hệ thống cho tới khi được kích hoạt lại.`
              : lifecycleActionState.action === 'resume'
                ? `Bạn có chắc chắn muốn kích hoạt lại chương trình khuyến mãi "${name}"?`
                : `Bạn có chắc chắn muốn kết thúc chương trình khuyến mãi "${name}"? Hành động này không thể hoàn tác và chương trình sẽ dừng vĩnh viễn.`,
        }}
        cancelLabel="Quay lại"
        confirmLabel={lifecycleActionState.action ? LIFECYCLE_CONFIRM_META[lifecycleActionState.action].confirmLabel : 'Xác nhận'}
        loading={lifecycleLoading}
        onCancel={() => setLifecycleActionState({ toggle: false })}
        onConfirm={handleLifecycleMutation}
        confirmButtonProps={lifecycleActionState.action ? LIFECYCLE_CONFIRM_META[lifecycleActionState.action].permission : undefined}
      />
    </Fragment>
  );
};

export default PromotionDetailPage;
