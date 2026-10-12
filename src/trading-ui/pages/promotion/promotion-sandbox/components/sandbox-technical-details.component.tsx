import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import type { RuntimeEvaluateRequestDto, RuntimeEvaluateResponseDto } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatVnd, getSchemaTypeLabel, getScopeLabel } from '../../components/promotion-runtime-evaluate-panel/promotion-simulation.helpers';
import { getSandboxReasonCodeLabel } from '../sandbox-display.helpers';
import { resolveOfferTitle } from '../../components/promotion-runtime-evaluate-panel/runtime-evaluate-display.helpers';
import { SANDBOX_INNER_CARD_SX } from '../sandbox-panel.shared';

interface SandboxTechnicalDetailsProps {
  result: RuntimeEvaluateResponseDto | null;
  payload: RuntimeEvaluateRequestDto | null;
  error?: string | null;
}

const JsonDebugBox = ({ label, value }: { label: string; value: unknown }) => (
  <Box sx={SANDBOX_INNER_CARD_SX}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054', mb: 0.75 }}>{label}</Typography>
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 1,
        borderRadius: '6px',
        bgcolor: '#F9FAFB',
        border: '1px solid #E5E7EB',
        fontSize: 11,
        lineHeight: 1.5,
        color: '#344054',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        maxHeight: 260,
        overflow: 'auto',
      }}
    >
      {JSON.stringify(value, null, 2)}
    </Box>
  </Box>
);

export const SandboxTechnicalDetails = ({ result, payload, error }: SandboxTechnicalDetailsProps) => {
  const [expanded, setExpanded] = useState(false);
  if (!expanded) {
    return (
      <Button
        size="small"
        variant="text"
        onClick={() => setExpanded(true)}
        startIcon={<UnfoldMoreOutlinedIcon sx={{ fontSize: 16 }} />}
        sx={{ textTransform: 'none', color: '#475467', alignSelf: 'flex-start', px: 0 }}
      >
        Chi tiết kỹ thuật
      </Button>
    );
  }

  return (
    <Stack sx={{ gap: 1.25, pt: 0.5 }}>
      <Button
        size="small"
        variant="text"
        onClick={() => setExpanded(false)}
        startIcon={<UnfoldLessOutlinedIcon sx={{ fontSize: 16 }} />}
        sx={{ textTransform: 'none', color: '#475467', alignSelf: 'flex-start', px: 0 }}
      >
        Ẩn chi tiết kỹ thuật
      </Button>

      {error ? (
        <Box sx={SANDBOX_INNER_CARD_SX}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054', mb: 0.75 }}>Lỗi giả lập (debug)</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', overflowWrap: 'anywhere' }}>{error}</Typography>
        </Box>
      ) : null}

      {result ? (
        <>
          <Box sx={SANDBOX_INNER_CARD_SX}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054', mb: 0.75 }}>Các ưu đãi được hệ thống xem xét</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
              Nhóm điều kiện đã kiểm tra: {result.explain.totalLookupKeys} · Ưu đãi phù hợp ban đầu: {result.explain.matchedCandidateCount} · Ưu đãi trùng đã gộp:{' '}
              {result.explain.dedupedCandidateCount}
            </Typography>
          </Box>

          {result.candidates.length > 0 ? (
            <Stack sx={{ gap: 0.75 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054' }}>Ưu đãi có thể liên quan ({result.candidates.length})</Typography>
              {result.candidates.map((candidate) => (
                <Box key={`${candidate.promotionSchemaId}-${candidate.promotionSnapshotId}`} sx={SANDBOX_INNER_CARD_SX}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{resolveOfferTitle(candidate)}</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
                    {candidate.promotionName ?? 'Chương trình'} · {getScopeLabel(candidate.scope)} · {getSandboxReasonCodeLabel(candidate.reasonCode)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : null}

          {result.evaluations.length > 0 ? (
            <Stack sx={{ gap: 0.75 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054' }}>Lý do áp dụng hoặc bỏ qua ({result.evaluations.length})</Typography>
              {result.evaluations.map((evaluation) => (
                <Box key={`eval-${evaluation.promotionSchemaId}-${evaluation.promotionSnapshotId}`} sx={SANDBOX_INNER_CARD_SX}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
                    {resolveOfferTitle(evaluation)} ({getSchemaTypeLabel(evaluation.schemaType)})
                  </Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
                    {evaluation.promotionName ?? 'Chương trình'} · {evaluation.status === 'APPLICABLE' ? 'Được dùng' : 'Chưa dùng được'} · Giảm {formatVnd(evaluation.totalDiscountAmountMinor)}
                  </Typography>
                  {evaluation.reasonCodes.length > 0 ? (
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#98A2B3', mt: 0.5 }}>{evaluation.reasonCodes.map(getSandboxReasonCodeLabel).join(' · ')}</Typography>
                  ) : null}
                </Box>
              ))}
            </Stack>
          ) : null}

          {payload ? <JsonDebugBox label="Dữ liệu gửi đi" value={payload} /> : null}
          <JsonDebugBox label="Dữ liệu trả về" value={result} />
        </>
      ) : null}
    </Stack>
  );
};
