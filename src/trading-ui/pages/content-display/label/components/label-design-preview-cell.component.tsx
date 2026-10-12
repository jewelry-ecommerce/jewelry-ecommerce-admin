import { Box, type BoxProps, Typography } from '@mui/material';
import { type BadgeTemplate, BadgeType } from '../../../../apis';
import { StackRowAlignJustCenter } from '../../../../components/styled/stack.style';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';

export const LabelPreviewFrame = ({ children, sx }: BoxProps) => (
  <StackRowAlignJustCenter
    sx={{
      width: 96,
      maxWidth: '100%',
      minWidth: 96,
      border: '1px dashed #CBD5E1',
      borderRadius: 1,
      p: '8px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      ...sx,
    }}
  >
    {children}
  </StackRowAlignJustCenter>
);

// ------------------------------------------------------------
export interface LabelDesignPreviewCellProps {
  badgeTemplate: BadgeTemplate;
}

export const LabelDesignPreviewCell = ({ badgeTemplate }: LabelDesignPreviewCellProps) => {
  if (badgeTemplate.type === BadgeType.IMAGE) {
    return (
      <LabelPreviewFrame>
        <Box component="img" src={badgeTemplate?.image} alt="Image Label" sx={{ width: '100%', height: 40, objectFit: 'contain', borderRadius: 1, display: 'block' }} />
      </LabelPreviewFrame>
    );
  }

  return (
    <LabelPreviewFrame>
      <Typography
        sx={{
          width: '100%',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          textAlign: 'center',
          px: '8px',
          py: '4px',
          borderRadius: 1,
          ...TYPOGRAPHY_STYLES.sm.regular,
          color: badgeTemplate.styleConfig?.textColor,
          bgcolor: badgeTemplate.styleConfig?.backgroundColor,
        }}
      >
        {badgeTemplate.displayText || badgeTemplate.name}
      </Typography>
    </LabelPreviewFrame>
  );
};
