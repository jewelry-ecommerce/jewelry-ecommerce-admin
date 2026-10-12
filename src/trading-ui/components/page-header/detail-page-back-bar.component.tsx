import { Box, type SxProps, type Theme } from '@mui/material';
import { ArrowLeft } from '@untitledui/icons';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { CustomButton } from '../button';
import type { PageButtonPermissionProps } from '../../permissions/page-button-permission.utils';

const DEFAULT_LABEL = 'Quay lại danh sách';

const backBarSx: SxProps<Theme> = {
  display: 'flex',
  px: 2,
  py: 1.5,
  justifyContent: 'flex-start',
  alignItems: 'center',
  alignSelf: 'stretch',
  borderBottom: '1px solid #E5E7EB',
  bgcolor: 'transparent',
};

const backButtonSx: SxProps<Theme> = {
  textTransform: 'none',
  height: 40,
  px: 1.5,
  minWidth: 0,
  justifyContent: 'flex-start',
  borderRadius: 2,
  borderColor: '#D0D5DD',
  backgroundColor: 'transparent',
  color: '#4A5565',
  width: 'fit-content',
  boxShadow: 'none',
  ...TYPOGRAPHY_STYLES.base.medium,
  '&:hover': {
    backgroundColor: 'transparent',
    borderColor: '#D0D5DD',
    boxShadow: 'none',
  },
};

export type DetailPageBackBarProps = Partial<PageButtonPermissionProps> & {
  onBack: () => void;
  label?: string;
  barSx?: SxProps<Theme>;
};

export const DetailPageBackBar = ({ onBack, label = DEFAULT_LABEL, barSx, ...permissionProps }: DetailPageBackBarProps) => (
  <Box sx={barSx ? ([backBarSx, barSx] as SxProps<Theme>) : backBarSx}>
    <CustomButton variant="outline" fullWidth={false} startIcon={<ArrowLeft color="#4A5565" size={16} />} onClick={onBack} sx={backButtonSx} {...permissionProps}>
      {label}
    </CustomButton>
  </Box>
);
