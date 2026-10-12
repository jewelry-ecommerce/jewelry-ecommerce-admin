import { AddRounded, DeleteOutline, PauseCircleOutline } from '@mui/icons-material';
import { Stack, Tooltip, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import useSWR from 'swr';
import { cmsHeaderFooterApi, type HeaderAdmin } from '../../../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../../../components/button/custom-button';
import { PermissionIconButton } from '../../../../../../components/button/permission-icon-button';
import { EmptyComponent } from '../../../../../../components/empty/empty.component';
import { LoadingComponent } from '../../../../../../components/loading/loading.component';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../../components/styled/stack.style';
import { TagCommonComponent } from '../../../../../../components/tag';
import { contentTopBannerButtonPermission } from '../../../../content-permission.constants';
import { canStopHeader, getHeaderDisplayStatus, HEADER_STATUS_LABEL } from '../../site-top-banner.constants';
import { SiteTopBannerPageViews } from '../../site-top-banner.enum';
import type { SiteTopBannerGlobalState } from '../../site-top-banner.interface';

export interface TopBannerListPartProps {
  viewMode?: boolean;
  screenState: SiteTopBannerGlobalState;
  setScreenState: React.Dispatch<React.SetStateAction<SiteTopBannerGlobalState>>;
  onDelete: (header: HeaderAdmin) => void;
  onStop: (header: HeaderAdmin) => void;
}

export const TopBannerListPart: React.FC<TopBannerListPartProps> = ({ viewMode = false, screenState, setScreenState, onDelete, onStop }) => {
  const { data, isLoading } = useSWR('cms/admin/headers', () => cmsHeaderFooterApi.getHeaderList({ take: 100, isPagination: false }), { revalidateOnFocus: false });

  const headers = (data?.list ?? []) as HeaderAdmin[];

  const TopBannerRow = useCallback(
    ({ header }: { header: HeaderAdmin }) => {
      const isSelected = screenState.selectedHeaderId === header.id && screenState.view === SiteTopBannerPageViews.UPDATE;

      return (
        <StackRowAlignCenterJustBetween
          onClick={() => setScreenState({ view: SiteTopBannerPageViews.UPDATE, selectedHeaderId: header.id })}
          sx={{
            p: 1.5,
            borderRadius: 2,
            cursor: 'pointer',
            border: '1px solid',
            borderColor: isSelected ? '#101828' : '#E5E7EB',
            bgcolor: isSelected ? '#F9FAFB' : '#FFFFFF',
            '&:hover': { bgcolor: '#F9FAFB' },
            gap: 1.5,
          }}
        >
          <Stack sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }} noWrap>
              {header.bannerName}
            </Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280' }} noWrap>
              {header.bannerDisplayStyle === 'TEXT' ? header.bannerContent || '—' : 'Hình ảnh/video'} · {header.updatedAt ? new Date(header.updatedAt).toLocaleString('vi-VN') : '—'}
            </Typography>
          </Stack>
          <StackRowAlignCenter gap={0.5} sx={{ flexShrink: 0 }}>
            <TagCommonComponent content={HEADER_STATUS_LABEL[getHeaderDisplayStatus(header)] ?? header.status} border />
            {canStopHeader(header) && !viewMode ? (
              <Tooltip title="Ngừng banner">
                <PermissionIconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onStop(header);
                  }}
                  {...contentTopBannerButtonPermission('top_banner_stop', 'Ngừng top banner', 'api_cms_header_update')}
                >
                  <PauseCircleOutline fontSize="small" />
                </PermissionIconButton>
              </Tooltip>
            ) : null}
            {!viewMode ? (
              <Tooltip title="Xóa">
                <PermissionIconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(header);
                  }}
                  {...contentTopBannerButtonPermission('top_banner_delete', 'Xóa top banner', 'api_cms_header_update')}
                >
                  <DeleteOutline fontSize="small" />
                </PermissionIconButton>
              </Tooltip>
            ) : null}
          </StackRowAlignCenter>
        </StackRowAlignCenterJustBetween>
      );
    },
    [onDelete, onStop, screenState.selectedHeaderId, screenState.view, setScreenState, viewMode],
  );

  return (
    <Stack sx={{ height: '100%', minHeight: 0, gap: 2 }}>
      <StackRowAlignCenterJustBetween>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Danh sách top banner</Typography>
        {!viewMode ? (
          <CustomButton
            type="button"
            variant="primary"
            fullWidth={false}
            onClick={() => setScreenState({ view: SiteTopBannerPageViews.CREATE, selectedHeaderId: undefined })}
            sx={{ bgcolor: '#101828', boxShadow: 'none', '&:hover': { bgcolor: '#101828', opacity: 0.92 } }}
            startIcon={<AddRounded />}
            {...contentTopBannerButtonPermission('top_banner_create', 'Tạo top banner', 'api_cms_header_update')}
          >
            Tạo top banner
          </CustomButton>
        ) : null}
      </StackRowAlignCenterJustBetween>

      <Stack
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          bgcolor: '#FFFFFF',
          p: 2,
          gap: 1.5,
        }}
      >
        {isLoading ? <LoadingComponent /> : headers.length === 0 ? <EmptyComponent /> : headers.map((header) => <TopBannerRow key={header.id} header={header} />)}
      </Stack>
    </Stack>
  );
};
