import { Box, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { ItemRowImageCell } from '../item-row-image/item-row-image-cell.component';
import { StackRowAlignCenter } from '../styled';

export interface ItemRowInfoCellProps {
  itemId: string;
  itemName: string;
  thumbnailUrl?: string;
  subtitle?: string;
  variant?: 'default' | 'compact';
}

export const ItemRowInfoCell = ({ itemId, itemName, thumbnailUrl, subtitle, variant = 'compact' }: ItemRowInfoCellProps) => {
  const displaySubtitle = subtitle || itemId;
  const showSubCode = Boolean(displaySubtitle) && itemName !== displaySubtitle;

  return (
    <StackRowAlignCenter sx={{ minWidth: 0 }}>
      <ItemRowImageCell variant={variant} itemId={itemId} itemName={itemName} thumbnailUrl={thumbnailUrl} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#0F172A', lineHeight: 1.35 }} noWrap title={itemName}>
          {itemName}
        </Typography>
        {showSubCode && (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#64748B', lineHeight: 1.35, mt: 0.25 }} noWrap title={displaySubtitle}>
            {displaySubtitle}
          </Typography>
        )}
      </Box>
    </StackRowAlignCenter>
  );
};
