import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import { Settings01 } from '@untitledui/icons';
import { promotionApi, PromotionDraftStatus, type PromotionDraftSchema } from '../../apis';
import { LoadingComponent } from '../../components/loading/loading.component';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../components/styled';
import { TagCommonComponent } from '../../components/tag';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { getPromotionDetailPath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { LabelFormPageHeader } from '../content-display/label/components';
import { ProductSpuSectionPanel } from '../product/product-spu/components/product-spu-page-sections.component';
import { PromotionConfigSection } from './components/promotion-config-section.component';
import { ApplicabilityInlineForm } from './components/promotion-applicability';
import { AudienceInlineForm } from './components/promotion-audience';
import { GeneralInfoInlineForm, PromotionDetailSidebar } from './components/promotion-general';
import { PromotionPublishAction, PromotionPublishPanel } from './components/promotion-publish';
import { SchemaCreationWizard } from './components/promotion-schema-creation-wizard';
import { PromotionSchemaCard } from './components/promotion-schema-card.component';
import { TargetInlineForm } from './components/promotion-target';
import { getPromotionDetailSectionIcon, getPromotionDraftStatusLabel } from './promotion.constant';
import { storedDateTimeToIso } from '../../common/utils/date-format.util';
import { DialogConfirmComponent } from '../../components/dialog';
import { getErrorMessage } from '../../common/utils';
import { promotionListButtonPermission } from './promotion-permission.constants';
import { usePromotionDetailData } from './hooks/use-promotion-detail-data.hook';
import { getPromotionPublishErrorMessage, isPromotionDraftEditable, type HeaderDraftState } from './utils/promotion-detail.helpers';

const GeneralSectionIcon = getPromotionDetailSectionIcon('general');

const PromotionUpdatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const {
    promotionId,
    source,
    promotionDraft,
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
    fetchDetail,
    refreshComponents,
    fetchSchemas,
    handleNavigateSection,
    scrollContainerRef,
  } = usePromotionDetailData();

  const [schemaWizardOpen, setSchemaWizardOpen] = useState(false);
  const [editingSchema, setEditingSchema] = useState<PromotionDraftSchema | null>(null);
  const [headerSaving, setHeaderSaving] = useState(false);
  const [schemaDeletingId, setSchemaDeletingId] = useState<string | null>(null);
  const [schemaDeleteState, setSchemaDeleteState] = useState<{ toggle: boolean; schema?: PromotionDraftSchema }>({ toggle: false });
  const [schemaFocusId, setSchemaFocusId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const isEditable = isPromotionDraftEditable(source, promotionDraft);
  const canEditForms = isEditable;
  const schemaParentWindow = useMemo(() => (promotionDraft ? { startsAt: promotionDraft.startsAt, endsAt: promotionDraft.endsAt } : null), [promotionDraft]);

  useEffect(() => {
    if (loading || !promotionId) return;
    if (source !== 'draft' || !isEditable) {
      navigate(getPromotionDetailPath(promotionId, 'draft'), { replace: true });
    }
  }, [isEditable, loading, navigate, promotionId, source]);

  useEffect(() => {
    if (!schemaFocusId) return;
    const element = document.getElementById(`promotion-schema-${schemaFocusId}`);
    if (!(element instanceof HTMLElement)) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.focus();

    const timeoutId = window.setTimeout(() => {
      setSchemaFocusId((current) => (current === schemaFocusId ? null : current));
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [schemaFocusId, schemas]);

  const handleSaveHeader = async (draft: HeaderDraftState) => {
    if (!promotionDraft) return;
    if (!draft.name.trim()) {
      window.alert('Vui lòng nhập tên chương trình khuyến mãi.');
      return;
    }

    setHeaderSaving(true);
    try {
      await promotionApi.updatePromotionDraft(promotionDraft.id, {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        startsAt: storedDateTimeToIso(draft.startsAtDate),
        endsAt: storedDateTimeToIso(draft.endsAtDate, true),
      });
      await fetchDetail({ silent: true });
      showSnackbar({ message: 'Đã lưu thông tin chương trình.', type: SnackbarType.SUCCESS });
    } finally {
      setHeaderSaving(false);
    }
  };

  const handleOpenSchemaCreate = useCallback(() => {
    setEditingSchema(null);
    setSchemaWizardOpen(true);
  }, []);

  const handleOpenSchemaEdit = useCallback((schema: PromotionDraftSchema) => {
    setEditingSchema(schema);
    setSchemaWizardOpen(true);
  }, []);

  const handleCloseSchemaWizard = useCallback(
    (options?: { refreshSchemas?: boolean; schemaId?: string }) => {
      setSchemaWizardOpen(false);
      setEditingSchema(null);
      if (!options?.refreshSchemas) return;
      if (options.schemaId) setSchemaFocusId(options.schemaId);
      void fetchSchemas();
    },
    [fetchSchemas],
  );

  const handleSchemaWizardFinished = useCallback(
    async (schemaId: string) => {
      setSchemaWizardOpen(false);
      setEditingSchema(null);
      setSchemaFocusId(schemaId);
      await fetchSchemas();
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã hoàn tất cấu hình hình thức khuyến mãi.' });
    },
    [fetchSchemas, showSnackbar],
  );

  const handleDeleteSchema = useCallback(async () => {
    const schema = schemaDeleteState.schema;
    if (!promotionId || !schema) return;

    setSchemaDeletingId(schema.id);
    try {
      await promotionApi.deletePromotionDraftSchema(promotionId, schema.id);
      setSchemaDeleteState({ toggle: false });
      await fetchSchemas();
      showSnackbar({ message: 'Đã xoá hình thức khuyến mãi.', type: SnackbarType.SUCCESS });
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setSchemaDeletingId(null);
    }
  }, [fetchSchemas, promotionId, schemaDeleteState.schema, showSnackbar]);

  const handlePublishDraft = useCallback(async (): Promise<boolean> => {
    if (!promotionId || !publishReadiness?.canPublish || publishing) return false;
    setPublishing(true);
    try {
      await promotionApi.publishPromotionDraft(promotionId);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Phát hành chương trình khuyến mãi thành công.' });
      navigate(ROUTE_PATH.PROMOTION);
      return true;
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getPromotionPublishErrorMessage(error) });
      return false;
    } finally {
      setPublishing(false);
    }
  }, [navigate, promotionId, publishReadiness?.canPublish, publishing, showSnackbar]);

  if (loading) return <LoadingComponent size="large" />;

  const statusLabel = getPromotionDraftStatusLabel(promotionDraft?.status ?? PromotionDraftStatus.EDITING);

  return (
    <Fragment>
      <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0, bgcolor: '#F9FAFB', gap: 0, overflow: 'hidden' }}>
        <LabelFormPageHeader variant="backOnly" onBack={() => navigate(ROUTE_PATH.PROMOTION)} />

        <StackRowAlignCenterJustBetween sx={{ px: 3, py: 2, gap: 1.5, flexWrap: 'wrap', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>{name}</Typography>
          <StackRowAlignCenter>
            <TagCommonComponent border content={statusLabel} color="default" />
            {promotionDraft && publishReadiness && canEditForms ? (
              <PromotionPublishAction promotion={promotionDraft} readiness={publishReadiness} publishing={publishing} onPublish={handlePublishDraft} />
            ) : null}
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
                  {promotionDraft ? <GeneralInfoInlineForm promotion={promotionDraft} editable={canEditForms} saving={headerSaving} onSave={(draft) => void handleSaveHeader(draft)} /> : null}
                </ProductSpuSectionPanel>
              </Box>

              {showConfigurationSections ? (
                <>
                  <Box id="promotion-section-target">
                    <PromotionConfigSection
                      id="target"
                      title="Phạm vi sản phẩm"
                      action={null}
                      isEmpty={false}
                      emptyState={{
                        icon: <Settings01 size={40} color="#98A2B3" />,
                        title: 'Chưa cấu hình sản phẩm áp dụng',
                        description: 'Vui lòng chọn sản phẩm áp dụng trước khi tạo hình thức khuyến mãi. Mọi hình thức khuyến mãi trong chương trình sẽ dùng chung phạm vi này.',
                      }}
                    >
                      <TargetInlineForm
                        promotionId={promotionId ?? ''}
                        initialTarget={target?.config ?? null}
                        initialSkus={target?.skus}
                        initialExcludedSkus={target?.excludedSkus}
                        editable={canEditForms}
                        onSaved={() => refreshComponents()}
                      />
                    </PromotionConfigSection>
                  </Box>
                  <Box id="promotion-section-audience">
                    <PromotionConfigSection
                      id="audience"
                      title="Đối tượng khách hàng"
                      action={null}
                      isEmpty={false}
                      emptyState={{
                        icon: <Settings01 size={40} color="#98A2B3" />,
                        title: 'Chưa cấu hình đối tượng khách hàng',
                        description: 'Vui lòng chọn đối tượng khách hàng áp dụng.',
                      }}
                    >
                      <AudienceInlineForm
                        promotionId={promotionId ?? ''}
                        initialAudience={audience?.config ?? null}
                        initialCustomers={audience?.customers}
                        editable={canEditForms}
                        onSaved={() => refreshComponents()}
                      />
                    </PromotionConfigSection>
                  </Box>

                  <Box id="promotion-section-applicability">
                    <PromotionConfigSection
                      id="applicability"
                      title="Phạm vi áp dụng"
                      action={null}
                      isEmpty={false}
                      emptyState={{
                        icon: <Settings01 size={40} color="#98A2B3" />,
                        title: 'Chưa cấu hình phạm vi áp dụng',
                        description: 'Chương trình đang chạy theo mặc định: chỉ online, mọi cửa hàng.',
                      }}
                    >
                      <ApplicabilityInlineForm promotionId={promotionId ?? ''} initialApplicability={applicability?.config ?? null} editable={canEditForms} onSaved={() => refreshComponents()} />
                    </PromotionConfigSection>
                  </Box>

                  <Box id="promotion-section-schemas">
                    <PromotionConfigSection
                      id="schemas"
                      title="Hình thức khuyến mãi"
                      action={
                        canEditForms
                          ? {
                              label: 'Thêm hình thức khuyến mãi',
                              icon: <AddCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />,
                              onClick: handleOpenSchemaCreate,
                              ...promotionListButtonPermission('edit', 'Thêm hình thức khuyến mãi', 'api_promotion_draft_update'),
                            }
                          : null
                      }
                      isEmpty={schemas.length === 0}
                      emptyState={{
                        icon: <Settings01 size={40} color="#98A2B3" />,
                        title: 'Chưa có hình thức khuyến mãi',
                        description: 'Thêm ít nhất một hình thức khuyến mãi để định nghĩa cơ chế ưu đãi và phạm vi áp dụng.',
                      }}
                    >
                      <Stack>
                        {schemas.map((schema) => (
                          <PromotionSchemaCard
                            key={schema.id}
                            schema={schema}
                            schemaComponents={schemaComponentsBySchemaId[schema.id]}
                            voucherCode={voucherCodesBySchemaId[schema.id]}
                            isEditable={canEditForms}
                            isFocused={schemaFocusId === schema.id}
                            isDeleting={schemaDeletingId === schema.id}
                            onEdit={() => handleOpenSchemaEdit(schema)}
                            onDelete={() => setSchemaDeleteState({ toggle: true, schema })}
                          />
                        ))}
                      </Stack>
                    </PromotionConfigSection>
                  </Box>

                  {promotionDraft && publishReadiness ? <Box id="promotion-section-publish">{publishReadiness ? <PromotionPublishPanel readiness={publishReadiness} /> : null}</Box> : null}
                </>
              ) : null}
            </Stack>
          </Box>
        </Box>
      </Stack>

      {promotionDraft ? (
        <SchemaCreationWizard
          open={schemaWizardOpen}
          draftId={promotionDraft.id}
          draftStatus={promotionDraft.status}
          parentWindow={schemaParentWindow}
          editSchema={editingSchema}
          initialComponents={editingSchema ? (schemaComponentsBySchemaId[editingSchema.id] ?? null) : null}
          onClose={handleCloseSchemaWizard}
          onFinished={handleSchemaWizardFinished}
        />
      ) : null}

      <DialogConfirmComponent
        open={schemaDeleteState.toggle}
        onClose={() => setSchemaDeleteState({ toggle: false })}
        title="Xác nhận xoá hình thức khuyến mãi"
        highlight={{
          tone: 'danger',
          title: schemaDeleteState.schema ? `Xoá hình thức khuyến mãi "${schemaDeleteState.schema.name}"? Hành động này không thể hoàn tác.` : '',
        }}
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận Xoá"
        loading={schemaDeleteState.schema ? schemaDeletingId === schemaDeleteState.schema.id : false}
        onCancel={() => setSchemaDeleteState({ toggle: false })}
        onConfirm={() => void handleDeleteSchema()}
      />
    </Fragment>
  );
};

export default PromotionUpdatePage;
