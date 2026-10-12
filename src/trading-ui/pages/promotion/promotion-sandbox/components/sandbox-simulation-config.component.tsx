import { useEffect, useMemo, type ChangeEvent } from 'react';
import { Box, FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import type { PromotionDraft } from '../../../../apis';
import { SelectInput, TextDateInput, TextInput } from '../../../../components/form';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { SANDBOX_SECTION_TITLE_SX } from '../sandbox-panel.shared';

export interface SandboxSimulationConfigProps {
  promotions: readonly PromotionDraft[];
  evaluatedAt: string;
  onEvaluatedAtChange: (value: string) => void;
  customerMode: 'guest' | 'logged-in';
  onCustomerModeChange: (mode: 'guest' | 'logged-in') => void;
  customerId: string;
  onCustomerIdChange: (value: string) => void;
  selectedDraftId: string;
  onSelectedDraftChange: (draftId: string) => void;
}

const DraftPicker = ({ promotions, selectedDraftId, onSelectedDraftChange }: { promotions: readonly PromotionDraft[]; selectedDraftId: string; onSelectedDraftChange: (draftId: string) => void }) => {
  const draftOptions = useMemo(() => promotions.map((promotion) => ({ value: promotion.id, label: promotion.name })), [promotions]);

  useEffect(() => {
    if (!selectedDraftId) return;
    if (promotions.some((promotion) => promotion.id === selectedDraftId)) return;
    onSelectedDraftChange('');
  }, [onSelectedDraftChange, promotions, selectedDraftId]);

  if (promotions.length === 0) {
    return (
      <Box sx={{ p: 1.25, border: '1px dashed #D0D5DD', borderRadius: '8px', bgcolor: '#FCFCFD' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Không có chương trình nháp chưa phát hành phù hợp để kiểm thử.</Typography>
      </Box>
    );
  }

  return (
    <SelectInput
      placeholder="Để trống để kiểm tra các chương trình đang phát hành"
      value={selectedDraftId}
      onChange={(event) => onSelectedDraftChange(event.target.value)}
      options={draftOptions}
      allowDeselect
    />
  );
};

export const SandboxSimulationConfig = ({
  promotions,
  evaluatedAt,
  onEvaluatedAtChange,
  customerMode,
  onCustomerModeChange,
  customerId,
  onCustomerIdChange,
  selectedDraftId,
  onSelectedDraftChange,
}: SandboxSimulationConfigProps) => {
  return (
    <Stack sx={{ gap: 1.5 }}>
      <Stack sx={{ gap: 0.25 }}>
        <Typography sx={SANDBOX_SECTION_TITLE_SX}>Thông tin giả lập</Typography>
      </Stack>

      <Stack sx={{ gap: 0.75 }}>
        <TextDateInput label="Thời điểm kiểm thử" requiredMark value={evaluatedAt} onChange={onEvaluatedAtChange} mode="dateTime" placeholder="Chọn thời điểm" />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Mốc này dùng để xem chương trình khuyến mãi nào đang hiệu lực tại thời điểm đó.</Typography>
      </Stack>

      <Stack sx={{ gap: 0.75 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#344054' }}>Thông tin khách hàng</Typography>
        <RadioGroup row value={customerMode} onChange={(_, value) => onCustomerModeChange(value as 'guest' | 'logged-in')} sx={{ gap: 1 }}>
          <FormControlLabel value="guest" control={<Radio size="small" />} label={<Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>Khách vãng lai</Typography>} />
          <FormControlLabel value="logged-in" control={<Radio size="small" />} label={<Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>Khách thành viên</Typography>} />
        </RadioGroup>
        {customerMode === 'logged-in' ? (
          <TextInput
            label="Mã khách hàng"
            value={customerId}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onCustomerIdChange(event.target.value)}
            placeholder="Nhập mã khách hàng"
            size="small"
          />
        ) : null}
      </Stack>

      <Stack sx={{ gap: 0.75 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#344054' }}>Chương trình khuyến mãi cần kiểm thử</Typography>
        <DraftPicker promotions={promotions} selectedDraftId={selectedDraftId} onSelectedDraftChange={onSelectedDraftChange} />
      </Stack>
    </Stack>
  );
};
