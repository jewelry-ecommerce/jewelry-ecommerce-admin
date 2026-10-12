import type { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { InfoCircle } from '@untitledui/icons';
import { CustomButton } from '../../../components/button';
import { StackRowAlignCenter, StackRowAlignStartJustBetween } from '../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import type { PageButtonPermissionProps } from '../../../permissions/page-button-permission.utils';
import { PROMOTION_DETAIL_SECTION_ICONS } from '../promotion.constant';

interface PromotionConfigSectionAction extends Partial<PageButtonPermissionProps> {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface PromotionConfigSectionEmptyState {
  icon: ReactNode;
  title: string;
  description: string;
  action?: PromotionConfigSectionAction;
}

interface PromotionConfigSectionProps {
  id: string;
  title: string;
  titleSuffix?: ReactNode;
  action?: PromotionConfigSectionAction | null;
  isEmpty: boolean;
  emptyState: PromotionConfigSectionEmptyState;
  children: ReactNode;
}

const PRIMARY_ACTION_SX = {
  textTransform: 'none',
  bgcolor: '#101828',
  boxShadow: 'none',
  width: 'auto',
  minWidth: 160,
  flex: '0 0 auto',
  px: 2,
  '&:hover': { bgcolor: '#1D2939', boxShadow: 'none' },
};

const EMPTY_ACTION_SX = {
  textTransform: 'none',
  borderColor: '#D0D5DD',
  color: '#344054',
  '&:hover': { bgcolor: '#F9FAFB', borderColor: '#98A2B3' },
};

export const PromotionConfigSection = ({ id, title, titleSuffix, action, isEmpty, emptyState, children }: PromotionConfigSectionProps) => {
  const SectionIcon = PROMOTION_DETAIL_SECTION_ICONS[id] ?? InfoCircle;

  return (
    <Paper id={`promotion-section-${id}`} elevation={0} sx={{ p: 3, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
      <StackRowAlignStartJustBetween gap={2} sx={{ mb: 3 }}>
        <Box sx={{ minWidth: 0 }}>
          <StackRowAlignCenter gap={1}>
            <SectionIcon size={20} color="#737373" />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>
              {title}
              {titleSuffix ? <Box component="span"> {titleSuffix}</Box> : null}
            </Typography>
          </StackRowAlignCenter>
        </Box>

        {action &&
          (() => {
            const { label, icon, onClick, ...permissionProps } = action;
            return (
              <CustomButton fullWidth={false} startIcon={icon} onClick={onClick} sx={PRIMARY_ACTION_SX} {...permissionProps}>
                {label}
              </CustomButton>
            );
          })()}
      </StackRowAlignStartJustBetween>

      {isEmpty ? (
        <Box
          sx={{
            p: { xs: 3, sm: 6 },
            textAlign: 'center',
            bgcolor: '#F9FAFB',
            borderRadius: '8px',
            border: '1px dashed #D0D5DD',
          }}
        >
          <Box sx={{ display: 'inline-flex', mb: 1.5 }}>{emptyState.icon}</Box>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#344054' }}>{emptyState.title}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', mt: 0.5, mb: 2 }}>{emptyState.description}</Typography>
          {emptyState.action &&
            (() => {
              const { label, icon, onClick, ...permissionProps } = emptyState.action;
              return (
                <CustomButton fullWidth={false} variant="outline" startIcon={icon} onClick={onClick} sx={EMPTY_ACTION_SX} {...permissionProps}>
                  {label}
                </CustomButton>
              );
            })()}
        </Box>
      ) : (
        children
      )}
    </Paper>
  );
};
