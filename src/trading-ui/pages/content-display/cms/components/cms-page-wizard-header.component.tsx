import { Box, Typography } from '@mui/material';
import React from 'react';
import { ArrowLeft, Edit02, Eye } from '@untitledui/icons';
import { CustomButton } from '../../../../components/button/custom-button';
import { ButtonIconContentComponent } from '../../../../components/button';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackRowAlignCenter } from '../../../../components/styled';
import type { PageButtonPermissionProps } from '../../../../permissions/page-button-permission.utils';
import { contentCmsPagesButtonPermission } from '../../content-permission.constants';

export interface CmsPageWizardHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  showPreviewAction?: boolean;
  showPublishAction?: boolean;
  onPreview?: () => void;
  onPublish?: () => void;
  loadingPublish?: boolean;
  viewMode?: boolean;
  onEdit?: () => void;
  editPermission?: PageButtonPermissionProps;
}

export const CmsPageWizardHeader: React.FC<CmsPageWizardHeaderProps> = ({ title, subtitle, onBack, showPreviewAction, onPreview, viewMode = false, onEdit, editPermission }) => {
  return (
    <StackRowAlignCenter
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: '1px solid #E5E7EB',
        bgcolor: '#FFF',
        alignItems: 'center',
      }}
    >
      <Box sx={{ cursor: 'pointer' }}>
        <ArrowLeft size={20} onClick={onBack} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, pl: 1 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>{title}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>{subtitle}</Typography>
      </Box>
      {viewMode && onEdit ? (
        <ButtonIconContentComponent
          content="Chỉnh sửa"
          icon={<Edit02 size={20} color="#737373" />}
          onClick={onEdit}
          {...(editPermission ?? contentCmsPagesButtonPermission('edit', 'Chỉnh sửa trang CMS', 'api_cms_page_update'))}
          sx={{ color: '#101828', border: '1px solid #111827', padding: '6px 12px' }}
        />
      ) : null}
      {!viewMode && showPreviewAction ? (
        <StackRowAlignCenter sx={{ gap: 1 }}>
          <CustomButton
            type="button"
            variant="outline"
            fullWidth={false}
            onClick={onPreview}
            startIcon={<Eye size={18} />}
            sx={{ px: 2 }}
            {...contentCmsPagesButtonPermission('preview', 'Xem trước trang CMS', 'api_cms_page_detail')}
          >
            Xem trước
          </CustomButton>
        </StackRowAlignCenter>
      ) : null}
    </StackRowAlignCenter>
  );
};
