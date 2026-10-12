import { Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { STYLE } from '@/trading-ui/adapters/library';
import { cmsHeaderFooterApi, type HeaderAdmin } from '../../../../apis';
import { getErrorMessage } from '../../../../common/utils';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { WrapperComponent } from '../../../../components/wrapper';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled/stack.style';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { contentTopBannerButtonPermission } from '../../content-permission.constants';
import { ContentSettingsEditToolbar } from '../../components/content-settings-edit-toolbar.component';
import { useContentSettingsViewMode } from '../../hooks/use-content-settings-view-mode.hook';
import { TopBannerDeleteDialog } from './components/top-banner-delete-dialog.component';
import { TopBannerStopDialog } from './components/top-banner-stop-dialog.component';
import { SiteTopBannerPageViews } from './site-top-banner.enum';
import type { SiteTopBannerGlobalState } from './site-top-banner.interface';
import { TopBannerListPart } from './parts/top-banner-list/top-banner-list.part';
import { TopBannerFormPart } from './parts/top-banner-form/top-banner-form.part';

const SiteTopBannerPage = () => {
  const { showSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig();
  const [screenState, setScreenState] = useState<SiteTopBannerGlobalState>({
    view: SiteTopBannerPageViews.LIST,
    selectedHeaderId: undefined,
  });
  const [deleteTarget, setDeleteTarget] = useState<HeaderAdmin | null>(null);
  const [stopTarget, setStopTarget] = useState<HeaderAdmin | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingStop, setLoadingStop] = useState(false);
  const panelOpen = screenState.view !== SiteTopBannerPageViews.LIST;

  const { viewMode, enterEditMode, cancelEditMode } = useContentSettingsViewMode(() => {
    setScreenState({ view: SiteTopBannerPageViews.LIST, selectedHeaderId: undefined });
  });

  const handleStop = async () => {
    if (!stopTarget) return;
    setLoadingStop(true);
    try {
      await cmsHeaderFooterApi.patchHeaderStatus(stopTarget.id, { status: 'DEACTIVE' });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã ngừng top banner.' });
      setStopTarget(null);
      await mutate('cms/admin/headers');
      if (screenState.selectedHeaderId === stopTarget.id) {
        await mutate(['cms/admin/headers', stopTarget.id]);
      }
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setLoadingStop(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoadingDelete(true);
    try {
      await cmsHeaderFooterApi.deleteHeader(deleteTarget.id);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Xóa top banner thành công.' });
      setDeleteTarget(null);
      setScreenState({ view: SiteTopBannerPageViews.LIST, selectedHeaderId: undefined });
      await mutate('cms/admin/headers');
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <WrapperComponent
          label={
            <StackRowAlignCenterJustBetween sx={{ width: '100%' }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>Quản lý top banner</Typography>
              <ContentSettingsEditToolbar
                viewMode={viewMode}
                onEnterEdit={enterEditMode}
                onCancelEdit={cancelEditMode}
                editPermission={contentTopBannerButtonPermission('top_banner_edit', 'Chỉnh sửa top banner', 'api_cms_header_update')}
                cancelPermission={contentTopBannerButtonPermission('top_banner_edit', 'Hủy chỉnh sửa top banner', 'api_cms_header_update')}
              />
            </StackRowAlignCenterJustBetween>
          }
        >
          <StackRowAlignCenter sx={{ flex: 1, minHeight: 0, alignItems: 'stretch', gap: 2 }}>
            <Stack sx={{ flex: panelOpen ? '4 1 0%' : '1 1 auto', minWidth: 0, minHeight: 0 }}>
              <TopBannerListPart viewMode={viewMode} screenState={screenState} setScreenState={setScreenState} onDelete={setDeleteTarget} onStop={setStopTarget} />
            </Stack>

            {panelOpen ? (
              <Stack
                sx={{
                  flex: '6 1 0%',
                  minWidth: 0,
                  minHeight: 0,
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  bgcolor: '#FFFFFF',
                  overflow: 'hidden',
                  p: 2,
                }}
              >
                <TopBannerFormPart viewMode={viewMode} screenState={screenState} setScreenState={setScreenState} />
              </Stack>
            ) : null}
          </StackRowAlignCenter>
        </WrapperComponent>
      </Stack>

      <TopBannerDeleteDialog deleteTarget={deleteTarget} loading={loadingDelete} onClose={() => setDeleteTarget(null)} onConfirm={() => void handleDelete()} />
      <TopBannerStopDialog stopTarget={stopTarget} loading={loadingStop} onClose={() => setStopTarget(null)} onConfirm={() => void handleStop()} />
    </Stack>
  );
};

export default SiteTopBannerPage;
