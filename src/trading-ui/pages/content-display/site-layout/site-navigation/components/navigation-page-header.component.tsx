import { PublishRounded } from '@mui/icons-material';
import { Chip, CircularProgress, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../../components/button/custom-button';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../components/styled/stack.style';
import { contentNavigationButtonPermission } from '../../../content-permission.constants';
import { ContentSettingsEditToolbar } from '../../../components/content-settings-edit-toolbar.component';

export type NavigationPageHeaderProps = {
  viewMode: boolean;
  onEnterEdit: () => void;
  onCancelEdit: () => void;
  hasPendingPublish?: boolean;
  publishing: boolean;
  onPublish: () => void;
};

export const NavigationPageHeader = ({ viewMode, onEnterEdit, onCancelEdit, hasPendingPublish, publishing, onPublish }: NavigationPageHeaderProps) => (
  <StackRowAlignCenterJustBetween sx={{ width: '100%' }}>
    <StackRowAlignCenter gap={1}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828', whiteSpace: 'nowrap' }}>Quản lý menu điều hướng</Typography>
      {hasPendingPublish ? <Chip size="small" label="Có thay đổi chưa xuất bản" color="warning" /> : null}
    </StackRowAlignCenter>
    <StackRowAlignCenter gap={1}>
      <ContentSettingsEditToolbar
        viewMode={viewMode}
        onEnterEdit={onEnterEdit}
        onCancelEdit={onCancelEdit}
        editPermission={contentNavigationButtonPermission('navigation_edit', 'Chỉnh sửa menu điều hướng', 'api_cms_navigation_update')}
        cancelPermission={contentNavigationButtonPermission('navigation_edit', 'Hủy chỉnh sửa menu điều hướng', 'api_cms_navigation_update')}
        editActions={
          <CustomButton
            variant="primary"
            fullWidth={false}
            disabled={!hasPendingPublish || publishing}
            startIcon={publishing ? <CircularProgress size={16} color="inherit" /> : <PublishRounded />}
            onClick={onPublish}
            sx={{
              textTransform: 'none',
              bgcolor: hasPendingPublish ? '#101828' : '#D0D5DD',
              boxShadow: 'none',
              '&:hover': { bgcolor: hasPendingPublish ? '#101828' : '#D0D5DD' },
            }}
            {...contentNavigationButtonPermission('navigation_publish', 'Xuất bản giao diện', 'api_cms_navigation_publish')}
          >
            Xuất bản giao diện
          </CustomButton>
        }
      />
    </StackRowAlignCenter>
  </StackRowAlignCenterJustBetween>
);
