import { Box, Card, CardContent, Typography } from '@mui/material';
import React from 'react';
import { type TargetDevice } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../components/button/custom-button';
import type { CmsPageWizardBlock } from '../cms-page.interface';
import { CmsPageWizardFooter } from './cms-page-wizard-footer.component';
import { contentCmsPagesButtonPermission } from '../../content-permission.constants';

export interface CmsPageWizardStepPublishProps {
  name: string;
  slug: string;
  locale: string;
  targetDevice: TargetDevice;
  blocks: CmsPageWizardBlock[];
  isPublishedVersion?: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  loadingPublish: boolean;
  viewMode?: boolean;
}

export const CmsPageWizardStepPublish: React.FC<CmsPageWizardStepPublishProps> = ({
  name,
  slug,
  locale,
  targetDevice,
  blocks,
  isPublishedVersion = false,
  onBack,
  onSaveDraft,
  onPublish,
  loadingPublish,
  viewMode = false,
}) => {
  return (
    <React.Fragment>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: '#E5E7EB',
          boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828', mb: 0.5 }}>Xác nhận xuất bản</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 2 }}>Kiểm tra lại thông tin trước khi xuất bản</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828', mb: 1 }}>Thông tin trang</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>
              <Box component="span" sx={{ color: '#6B7280' }}>
                Tên trang:{' '}
              </Box>
              {name || '—'}
            </Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>
              <Box component="span" sx={{ color: '#6B7280' }}>
                Đường dẫn:{' '}
              </Box>
              /{slug || '—'}
            </Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>
              <Box component="span" sx={{ color: '#6B7280' }}>
                Ngôn ngữ:{' '}
              </Box>
              {locale}
            </Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>
              <Box component="span" sx={{ color: '#6B7280' }}>
                Thiết bị:{' '}
              </Box>
              {targetDevice}
            </Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>
              <Box component="span" sx={{ color: '#6B7280' }}>
                Số khối:{' '}
              </Box>
              {blocks.length}
            </Typography>
          </Box>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828', mb: 1 }}>Danh sách khối</Typography>
          <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 2 }}>
            {blocks.map((b) => (
              <Typography key={b.clientId} component="li" sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>
                {b.title?.trim() || b.description?.trim() || b.blockTypeCode}
              </Typography>
            ))}
          </Box>
          <Box sx={{ bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 2, p: 1.5 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#92400E' }}>
              Lưu ý: Sau khi xuất bản, trang sẽ hiển thị trên giao diện tại website theo đường dẫn đã cấu hình. Bạn có thể chỉnh sửa và xuất bản lại sau.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <CmsPageWizardFooter
        left={
          <CustomButton type="button" variant="outline" fullWidth={false} onClick={onBack} sx={{ px: 3 }} {...contentCmsPagesButtonPermission('publish_back', 'Quay lại', 'api_cms_page_detail')}>
            Quay lại
          </CustomButton>
        }
        right={
          viewMode ? null : (
            <React.Fragment>
              <CustomButton
                type="button"
                variant="outline"
                fullWidth={false}
                onClick={onSaveDraft}
                sx={{ px: 3 }}
                {...contentCmsPagesButtonPermission('save_draft', isPublishedVersion ? 'Lưu' : 'Lưu nháp', 'api_cms_page_update')}
              >
                {isPublishedVersion ? 'Lưu' : 'Lưu nháp'}
              </CustomButton>
              {!isPublishedVersion ? (
                <CustomButton
                  type="button"
                  variant="primary"
                  fullWidth={false}
                  onClick={onPublish}
                  disabled={loadingPublish}
                  sx={{ px: 3, minWidth: 140 }}
                  {...contentCmsPagesButtonPermission('publish', 'Xuất bản ngay', 'api_cms_layout_version_publish')}
                >
                  Xuất bản ngay
                </CustomButton>
              ) : null}
            </React.Fragment>
          )
        }
      />
    </React.Fragment>
  );
};
