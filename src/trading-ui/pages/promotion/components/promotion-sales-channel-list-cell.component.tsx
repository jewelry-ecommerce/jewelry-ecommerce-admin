import { Typography } from '@mui/material';
import { type PromotionSalesChannel } from '../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { APPLICABILITY_CHANNEL_OPTIONS } from './promotion-applicability/promotion-applicability-form.mapper';

interface PromotionSalesChannelListCellProps {
  channels: readonly PromotionSalesChannel[];
}

export const PromotionSalesChannelListCell = ({ channels }: PromotionSalesChannelListCellProps) => {
  // Follow the option order so every row lists channels the same way regardless of how they were saved.
  const labels = APPLICABILITY_CHANNEL_OPTIONS.filter((option) => channels.includes(option.value)).map((option) => option.label);

  if (labels.length === 0) {
    return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#94A3B8' }}>—</Typography>;
  }

  return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#111827' }}>{labels.join(', ')}</Typography>;
};
