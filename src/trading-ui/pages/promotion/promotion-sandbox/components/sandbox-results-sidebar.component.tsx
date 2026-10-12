import { Box, Divider, Stack, Typography } from '@mui/material';

import {
  PromotionSimulationSourceType,
  RUNTIME_EVALUATE_REASON_CODE,
  type PromotionDraftSimulationMetadataDto,
  type PromotionSimulationCandidateSourceDto,
  type PromotionSimulationConflictEntryDto,
  type RejectedLineAdjustmentDto,
  type RuntimeCandidateEvaluationResultDto,
  type SelectedLineAdjustmentDto,
} from '../../../../apis';

import { StackAlignJustCenter, StackRowAlignCenterJustBetween, StackRowWrap } from '../../../../components/styled';

import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';

import { buildLineDisplayMap, resolveOfferTitle, resolveVariantLabel } from '../../components/promotion-runtime-evaluate-panel/runtime-evaluate-display.helpers';

import { useSandboxSimulation } from '../../components/promotion-runtime-evaluate-panel/sandbox-simulation.context';

import { formatVnd, formatSignedVnd, getSchemaTypeLabel, getScopeLabel, isPromotionDraftSimulationResponse } from '../../components/promotion-runtime-evaluate-panel/promotion-simulation.helpers';

import { getSandboxReasonCodeLabel, getSandboxSimulationOutcomeLabel, getSandboxSimulationSourceLabel } from '../sandbox-display.helpers';

import { useSandboxDraftSchemaMap, type SandboxDraftSchemaDetail } from '../hooks/use-sandbox-draft-schema-map';

import { SANDBOX_COLUMN_BODY_SX, SANDBOX_COLUMN_HEADER_SX, SANDBOX_COLUMN_SX, SANDBOX_INNER_CARD_SX, SANDBOX_SECTION_TITLE_SX } from '../sandbox-panel.shared';

import { SandboxTechnicalDetails } from './sandbox-technical-details.component';

const BreakdownRow = ({ label, value }: { label: string; value: string }) => (
  <StackRowAlignCenterJustBetween sx={{ py: 0.75 }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#000' }}>{label}</Typography>

    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#000' }}>{value}</Typography>
  </StackRowAlignCenterJustBetween>
);

const resolveSchemaDisplayName = (schemaId: string, dtoName: string | undefined, schemaMap: ReadonlyMap<string, SandboxDraftSchemaDetail>): string => {
  if (dtoName?.trim()) return dtoName.trim();

  const mapped = schemaMap.get(schemaId);

  if (mapped?.name.trim()) return mapped.name.trim();

  // TODO: BE_REQUIRED — add schemaName to evaluation result DTO

  return mapped ? getSchemaTypeLabel(mapped.schemaType) : 'Chưa đặt tên';
};

const resolveSchemaSummaries = (
  schemaId: string,

  schemaMap: ReadonlyMap<string, SandboxDraftSchemaDetail>,
): { conditionSummary: string | null; benefitSummary: string | null } => {
  const mapped = schemaMap.get(schemaId);

  if (!mapped) return { conditionSummary: null, benefitSummary: null };

  return { conditionSummary: mapped.conditionSummary, benefitSummary: mapped.benefitSummary };
};

interface SandboxOfferCardProps {
  title: string;

  schemaTypeLabel: string;

  schemeName: string;

  conditionSummary?: string | null;

  benefitSummary?: string | null;

  amount?: string;

  tone: 'success' | 'error' | 'neutral';

  reason?: string;
}

const SandboxOfferCard = ({ title, schemaTypeLabel, schemeName, conditionSummary, benefitSummary, amount, tone, reason }: SandboxOfferCardProps) => {
  const borderColor = tone === 'success' ? '#ABEFC6' : tone === 'error' ? '#FECDCA' : '#E5E7EB';

  const bgcolor = tone === 'success' ? '#F6FEF9' : tone === 'error' ? '#FFFBFA' : '#FCFCFD';

  return (
    <Box sx={{ ...SANDBOX_INNER_CARD_SX, borderColor, bgcolor }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{title}</Typography>

      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.25 }}>
        {schemaTypeLabel} · {schemeName}
      </Typography>

      {conditionSummary ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.5 }}>Điều kiện: {conditionSummary}</Typography> : null}

      {benefitSummary ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.25 }}>Quyền lợi: {benefitSummary}</Typography> : null}

      {amount ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: tone === 'success' ? '#039855' : '#B42318', mt: 0.75 }}>{amount}</Typography> : null}

      {reason ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.5 }}>{reason}</Typography> : null}
    </Box>
  );
};

const EvaluationSummaryCard = ({
  evaluation,

  schemaMap,
}: {
  evaluation: RuntimeCandidateEvaluationResultDto;

  schemaMap: ReadonlyMap<string, SandboxDraftSchemaDetail>;
}) => {
  const schemaId = evaluation.promotionSchemaId;

  const { conditionSummary, benefitSummary } = resolveSchemaSummaries(schemaId, schemaMap);

  const schemeName = resolveSchemaDisplayName(schemaId, evaluation.promotionSchemaName, schemaMap);

  const schemaTypeLabel = getSchemaTypeLabel(evaluation.schemaType);

  const reason = evaluation.status === 'REJECTED' ? evaluation.reasonCodes.map(getSandboxReasonCodeLabel).join(' · ') : undefined;

  return (
    <SandboxOfferCard
      title={resolveOfferTitle(evaluation)}
      schemaTypeLabel={schemaTypeLabel}
      schemeName={schemeName}
      conditionSummary={conditionSummary}
      benefitSummary={benefitSummary}
      amount={evaluation.status === 'APPLICABLE' ? `Giảm ước tính ${formatVnd(evaluation.totalDiscountAmountMinor)}` : undefined}
      tone={evaluation.status === 'APPLICABLE' ? 'success' : 'error'}
      reason={reason}
    />
  );
};

const SelectedAdjustmentRow = ({
  adjustment,

  variantLabel,

  step,

  schemaMap,
}: {
  adjustment: SelectedLineAdjustmentDto;

  variantLabel: string;

  step: number;

  schemaMap: ReadonlyMap<string, SandboxDraftSchemaDetail>;
}) => {
  const { conditionSummary, benefitSummary } = resolveSchemaSummaries(adjustment.promotionSchemaId, schemaMap);

  const schemeName = resolveSchemaDisplayName(adjustment.promotionSchemaId, adjustment.promotionSchemaName, schemaMap);

  return (
    <Box sx={{ ...SANDBOX_INNER_CARD_SX, borderColor: '#ABEFC6', bgcolor: '#F6FEF9' }}>
      <StackRowAlignCenterJustBetween sx={{ gap: 1, mb: 0.75 }}>
        <Box component="span" sx={{ fontSize: 11, fontWeight: 700, lineHeight: '18px', px: 0.75, borderRadius: '4px', bgcolor: '#ECFDF3', color: '#027A48' }}>
          Lượt giảm {step}
        </Box>

        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#039855' }}>Giảm {formatVnd(adjustment.discountAmountMinor)}</Typography>
      </StackRowAlignCenterJustBetween>

      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{resolveOfferTitle(adjustment)}</Typography>

      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.25 }}>
        {getSchemaTypeLabel(adjustment.schemaType)} · {schemeName} · {variantLabel}
      </Typography>

      {conditionSummary ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.5 }}>Điều kiện: {conditionSummary}</Typography> : null}

      {benefitSummary ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.25 }}>Quyền lợi: {benefitSummary}</Typography> : null}

      <Divider sx={{ my: 0.75 }} />

      <BreakdownRow label="Số tiền được giảm" value={`-${formatVnd(adjustment.discountAmountMinor)}`} />

      <BreakdownRow label="Còn lại cho sản phẩm này" value={formatVnd(adjustment.effectiveLineSubtotalMinor)} />

      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.5 }}>
        {adjustment.reasonCodes.length > 0 ? adjustment.reasonCodes.map(getSandboxReasonCodeLabel).join(' · ') : getSandboxReasonCodeLabel(RUNTIME_EVALUATE_REASON_CODE.LINE_ADJUSTMENT_SELECTED)}
      </Typography>
    </Box>
  );
};

const RejectedAdjustmentRow = ({
  adjustment,

  variantLabel,

  schemaMap,
}: {
  adjustment: RejectedLineAdjustmentDto;

  variantLabel: string;

  schemaMap: ReadonlyMap<string, SandboxDraftSchemaDetail>;
}) => {
  const { conditionSummary, benefitSummary } = resolveSchemaSummaries(adjustment.promotionSchemaId, schemaMap);

  const schemeName = resolveSchemaDisplayName(adjustment.promotionSchemaId, adjustment.promotionSchemaName, schemaMap);

  return (
    <SandboxOfferCard
      title={resolveOfferTitle(adjustment)}
      schemaTypeLabel={getSchemaTypeLabel(adjustment.schemaType)}
      schemeName={`${schemeName} · ${variantLabel}`}
      conditionSummary={conditionSummary}
      benefitSummary={benefitSummary}
      amount={adjustment.discountAmountMinor !== '0' ? `Không được dùng, có thể giảm ${formatVnd(adjustment.discountAmountMinor)}` : 'Không được dùng'}
      tone="error"
      reason={adjustment.reasonCodes.map(getSandboxReasonCodeLabel).join(' · ')}
    />
  );
};

const SourceBadge = ({ sourceType }: { sourceType: PromotionSimulationSourceType | null }) => (
  <Box
    component="span"
    sx={{
      fontSize: 11,

      fontWeight: 700,

      lineHeight: '18px',

      px: 0.75,

      borderRadius: '4px',

      bgcolor: sourceType === PromotionSimulationSourceType.DRAFT ? '#ECFDF3' : '#F2F4F7',

      color: sourceType === PromotionSimulationSourceType.DRAFT ? '#027A48' : '#344054',

      flexShrink: 0,
    }}
  >
    {getSandboxSimulationSourceLabel(sourceType)}
  </Box>
);

const SchemeTypeCard = ({
  source,

  schemaMap,
}: {
  source: PromotionSimulationCandidateSourceDto;

  schemaMap: ReadonlyMap<string, SandboxDraftSchemaDetail>;
}) => {
  const schemaId = source.draftSchemaId ?? source.promotionSchemaId;

  const { conditionSummary, benefitSummary } = resolveSchemaSummaries(schemaId, schemaMap);

  const schemeName = resolveSchemaDisplayName(schemaId, undefined, schemaMap);

  return (
    <Box sx={SANDBOX_INNER_CARD_SX}>
      <StackRowAlignCenterJustBetween sx={{ gap: 1 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{getSchemaTypeLabel(source.schemaType)}</Typography>

        <SourceBadge sourceType={source.sourceType} />
      </StackRowAlignCenterJustBetween>

      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.5 }}>
        Hình thức: {schemeName} · {getScopeLabel(source.scope)}
      </Typography>

      {conditionSummary ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.25 }}>Điều kiện: {conditionSummary}</Typography> : null}

      {benefitSummary ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.25 }}>Quyền lợi: {benefitSummary}</Typography> : null}
    </Box>
  );
};

const PromotionSchemeTypesSection = ({
  sources,

  schemaMap,
}: {
  sources: readonly PromotionSimulationCandidateSourceDto[];

  schemaMap: ReadonlyMap<string, SandboxDraftSchemaDetail>;
}) => (
  <Stack sx={{ gap: 0.75 }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>Hình thức khuyến mãi ({sources.length})</Typography>

    {sources.length > 0 ? (
      sources.map((source) => <SchemeTypeCard key={`scheme-${source.sourceType}-${source.promotionSchemaId}-${source.promotionSnapshotId}`} source={source} schemaMap={schemaMap} />)
    ) : (
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Chưa có hình thức khuyến mãi nào được xét.</Typography>
    )}
  </Stack>
);

const ConflictCard = ({
  conflict,

  schemaMap,
}: {
  conflict: PromotionSimulationConflictEntryDto;

  schemaMap: ReadonlyMap<string, SandboxDraftSchemaDetail>;
}) => {
  const winnerSchemaId = conflict.winner?.promotionSchemaId ?? '';

  const loserSchemaId = conflict.loser?.promotionSchemaId ?? '';

  const winnerName = winnerSchemaId ? resolveSchemaDisplayName(winnerSchemaId, undefined, schemaMap) : 'Không xác định';

  const loserName = loserSchemaId ? resolveSchemaDisplayName(loserSchemaId, undefined, schemaMap) : 'Không xác định';

  return (
    <Box sx={SANDBOX_INNER_CARD_SX}>
      <Stack sx={{ gap: 0.75 }}>
        <StackRowAlignCenterJustBetween sx={{ gap: 1 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{getSandboxSimulationOutcomeLabel(conflict.outcome)}</Typography>

          <SourceBadge sourceType={conflict.winnerSource} />
        </StackRowAlignCenterJustBetween>

        <StackRowWrap sx={{ gap: 0.75 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
            Được dùng: {getSandboxSimulationSourceLabel(conflict.winnerSource)} · {winnerName}
          </Typography>

          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
            Không được dùng: {getSandboxSimulationSourceLabel(conflict.loserSource)} · {loserName}
          </Typography>
        </StackRowWrap>

        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
          Mức giảm được dùng: {formatVnd(conflict.winnerDiscountAmountMinor)} · Mức giảm không dùng: {formatVnd(conflict.loserDiscountAmountMinor)}
        </Typography>

        {conflict.reasonCodes.length > 0 ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#98A2B3' }}>{conflict.reasonCodes.map(getSandboxReasonCodeLabel).join(' · ')}</Typography> : null}
      </Stack>
    </Box>
  );
};

const SimulationComparison = ({
  simulation,

  schemaMap,
}: {
  simulation: PromotionDraftSimulationMetadataDto;

  schemaMap: ReadonlyMap<string, SandboxDraftSchemaDetail>;
}) => {
  const publishedSources = simulation.candidateSources.filter((source) => source.sourceType === PromotionSimulationSourceType.PUBLISHED);

  return (
    <Stack sx={{ gap: 1.25 }}>
      <Box sx={{ ...SANDBOX_INNER_CARD_SX, bgcolor: '#F9FAFB' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#344054', mb: 1 }}>Nếu phát hành chương trình nháp này</Typography>

        <BreakdownRow label="Mức giảm hiện tại" value={formatVnd(simulation.baselineTotalSelectedDiscountAmountMinor)} />

        <BreakdownRow label="Mức giảm sau khi phát hành" value={formatVnd(simulation.projectedTotalSelectedDiscountAmountMinor)} />

        <Divider sx={{ my: 1 }} />

        <BreakdownRow label="Chênh lệch cho khách hàng" value={formatSignedVnd(simulation.discountDeltaMinor)} />

        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.75 }}>Đây chỉ là kết quả xem trước, không tạo đơn hàng và không giữ voucher.</Typography>
      </Box>

      {publishedSources.length > 0 ? (
        <Stack sx={{ gap: 0.75 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054' }}>Ưu đãi đang phát hành được xét ({publishedSources.length})</Typography>

          {publishedSources.map((source) => (
            <SchemeTypeCard key={`published-${source.promotionSchemaId}-${source.promotionSnapshotId}`} source={source} schemaMap={schemaMap} />
          ))}
        </Stack>
      ) : null}

      <Stack sx={{ gap: 0.75 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>Ưu đãi cạnh tranh nhau ({simulation.conflicts.length})</Typography>

        {simulation.conflicts.length > 0 ? (
          simulation.conflicts.map((conflict, index) => <ConflictCard key={`${conflict.outcome}-${index}`} conflict={conflict} schemaMap={schemaMap} />)
        ) : (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Không có ưu đãi nào cạnh tranh nhau.</Typography>
        )}
      </Stack>
    </Stack>
  );
};

export const SandboxResultsSidebar = () => {
  const { selectedDraftId, result, error, evaluating, simulatedSubtotal, selectedDiscount, afterDiscountStr, lines, requestPayload } = useSandboxSimulation();

  const { schemaMap } = useSandboxDraftSchemaMap(selectedDraftId);

  const lineMap = buildLineDisplayMap(lines);

  const applicableEvals = result?.evaluations.filter((e) => e.status === 'APPLICABLE') ?? [];

  const rejectedEvals = result?.evaluations.filter((e) => e.status === 'REJECTED') ?? [];

  const selection = result?.selection;

  const simulationResult = result && isPromotionDraftSimulationResponse(result) ? result : null;

  const draftSchemeSources = simulationResult?.simulation.candidateSources.filter((source) => source.sourceType === PromotionSimulationSourceType.DRAFT) ?? [];

  const emptyResultText = 'Thêm sản phẩm vào giỏ để xem khách hàng sẽ được giảm bao nhiêu.';

  return (
    <Stack sx={SANDBOX_COLUMN_SX}>
      <Box sx={SANDBOX_COLUMN_HEADER_SX}>
        <Typography sx={SANDBOX_SECTION_TITLE_SX}>Kết quả cho khách hàng</Typography>
      </Box>

      <Stack sx={{ ...SANDBOX_COLUMN_BODY_SX, gap: 1.5 }}>
        {!result && !evaluating ? (
          <StackAlignJustCenter sx={{ py: 6, px: 2, textAlign: 'center' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>{emptyResultText}</Typography>
          </StackAlignJustCenter>
        ) : null}

        {evaluating && !result ? (
          <StackAlignJustCenter sx={{ py: 4 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Đang tính giá...</Typography>
          </StackAlignJustCenter>
        ) : null}

        {result ? (
          <>
            <Box sx={{ ...SANDBOX_INNER_CARD_SX, bgcolor: '#F9FAFB' }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#344054' }}>Chi tiết tính giá</Typography>

              <BreakdownRow label="Tạm tính" value={formatVnd(simulatedSubtotal)} />

              <BreakdownRow label="Tổng khuyến mãi" value={`-${formatVnd(selectedDiscount)}`} />

              <Divider sx={{ my: 1 }} />

              <BreakdownRow label="Tổng cộng" value={formatVnd(afterDiscountStr)} />
            </Box>

            {simulationResult ? <PromotionSchemeTypesSection sources={draftSchemeSources} schemaMap={schemaMap} /> : null}

            {simulationResult ? <SimulationComparison simulation={simulationResult.simulation} schemaMap={schemaMap} /> : null}

            <Stack sx={{ gap: 0.75 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#039855' }}>Ưu đãi áp dụng được ({applicableEvals.length})</Typography>

              {applicableEvals.length > 0 ? (
                applicableEvals.map((ev) => <EvaluationSummaryCard key={`ok-${ev.promotionSchemaId}-${ev.promotionSnapshotId}`} evaluation={ev} schemaMap={schemaMap} />)
              ) : (
                <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Giỏ hàng này chưa nhận được ưu đãi nào.</Typography>
              )}
            </Stack>

            <Stack sx={{ gap: 0.75 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#B42318' }}>Ưu đãi bị loại ({rejectedEvals.length})</Typography>

              {rejectedEvals.length > 0 ? (
                rejectedEvals.map((ev) => <EvaluationSummaryCard key={`rej-${ev.promotionSchemaId}-${ev.promotionSnapshotId}`} evaluation={ev} schemaMap={schemaMap} />)
              ) : (
                <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Không có ưu đãi nào bị loại.</Typography>
              )}
            </Stack>

            {selection ? (
              <Stack sx={{ gap: 0.75 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>Thứ tự giảm giá ({selection.selectedAdjustmentCount})</Typography>

                <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
                  Ưu đãi được tính lần lượt theo thứ tự dưới đây; mỗi lượt cho biết sản phẩm nào được giảm và còn lại bao nhiêu.
                </Typography>

                {selection.selectedLineAdjustments.length === 0 ? (
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Không có ưu đãi nào được dùng cho giỏ hàng này.</Typography>
                ) : null}

                {selection.selectedLineAdjustments.map((adj, index) => (
                  <SelectedAdjustmentRow
                    key={`sel-${adj.lineId}-${adj.promotionSchemaId}-${index}`}
                    adjustment={adj}
                    variantLabel={resolveVariantLabel(adj.lineId, adj.skuId, lineMap)}
                    step={index + 1}
                    schemaMap={schemaMap}
                  />
                ))}

                {selection.rejectedLineAdjustments.length > 0 ? (
                  <>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#B42318', mt: 0.5 }}>Ưu đãi không được dùng ({selection.rejectedAdjustmentCount})</Typography>

                    {selection.rejectedLineAdjustments.map((adj, index) => (
                      <RejectedAdjustmentRow
                        key={`rej-adj-${adj.lineId}-${adj.promotionSchemaId}-${index}`}
                        adjustment={adj}
                        variantLabel={resolveVariantLabel(adj.lineId, adj.skuId, lineMap)}
                        schemaMap={schemaMap}
                      />
                    ))}
                  </>
                ) : null}
              </Stack>
            ) : null}

            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#98A2B3' }}>Tính giá lúc: {new Date(result.evaluatedAt).toLocaleString('vi-VN')}</Typography>
          </>
        ) : null}

        {result || error ? <SandboxTechnicalDetails result={result} payload={requestPayload} error={error} /> : null}
      </Stack>
    </Stack>
  );
};
