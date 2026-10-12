import { Box, Stack, Typography } from '@mui/material';
import { Grid01, ShoppingBag03 } from '@untitledui/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { cmsGlobalConfigApi } from '../../../../apis';
import type { DiscountLabelConfig } from '../../../../apis/cms/cms-global-config.interface';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils';
import { CustomButton } from '../../../../components/button';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { HIGHLIGHT_STATUS_LABEL_COLOR, HighlightStatusToggle } from '../../../../components/switch/highlight-status-toggle.component';
import { WrapperComponent } from '../../../../components/wrapper';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { ContentSettingsEditToolbar } from '../../components/content-settings-edit-toolbar.component';
import { contentDiscountLabelButtonPermission } from '../../content-permission.constants';
import { useContentSettingsViewMode } from '../../hooks/use-content-settings-view-mode.hook';

const DISCOUNT_LABEL_GET_API = 'api_cms_get_admin_global_config_discount_label';
const DISCOUNT_LABEL_PUT_API = 'api_cms_put_admin_global_config_discount_label';
const DISCOUNT_LABEL_SAVE_APIS: string[] = [DISCOUNT_LABEL_PUT_API, DISCOUNT_LABEL_GET_API];

const DEFAULT_CONFIG: DiscountLabelConfig = {
  displayPercentPlp: true,
  displayPercentPdp: true,
  displayPercentCart: true,
};

const DiscountLabelSettingsPage = () => {
  const { showSnackbar } = useSnackbar();
  const [config, setConfig] = useState<DiscountLabelConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, mutate } = useSWR('cms/admin/global-config/discount-label', () => cmsGlobalConfigApi.getDiscountLabelConfig(), {
    revalidateOnFocus: false,
  });

  const resetFromServer = useCallback(() => {
    setConfig(data ?? DEFAULT_CONFIG);
  }, [data]);

  const { viewMode, enterEditMode, cancelEditMode, exitEditModeAfterSave } = useContentSettingsViewMode(resetFromServer);

  useEffect(() => {
    resetFromServer();
  }, [resetFromServer]);

  const hasChanges = useMemo(() => {
    const baseline = data ?? DEFAULT_CONFIG;
    return baseline.displayPercentPlp !== config.displayPercentPlp || baseline.displayPercentPdp !== config.displayPercentPdp || baseline.displayPercentCart !== config.displayPercentCart;
  }, [config, data]);

  const updateConfig = (patch: Partial<DiscountLabelConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await cmsGlobalConfigApi.putDiscountLabelConfig(config);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã lưu cấu hình nhãn giảm giá.' });
      await mutate();
      exitEditModeAfterSave();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  }, [config, exitEditModeAfterSave, mutate, showSnackbar]);

  if (isLoading && !data) {
    return (
      <WrapperComponent label="Nhãn giảm giá">
        <LoadingComponent />
      </WrapperComponent>
    );
  }

  return (
    <WrapperComponent
      label="Nhãn giảm giá"
      nodeLabel={
        <StackRowAlignCenterJustBetween sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E5E7EB' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>Thiết lập vị trí hiển thị</Typography>
          <ContentSettingsEditToolbar
            viewMode={viewMode}
            onEnterEdit={enterEditMode}
            onCancelEdit={cancelEditMode}
            editPermission={contentDiscountLabelButtonPermission('edit', 'Chỉnh sửa nhãn giảm giá', DISCOUNT_LABEL_SAVE_APIS)}
            cancelPermission={contentDiscountLabelButtonPermission('edit', 'Hủy chỉnh sửa nhãn giảm giá', DISCOUNT_LABEL_PUT_API)}
            editActions={
              <CustomButton
                type="button"
                variant="primary"
                fullWidth={false}
                disabled={!hasChanges || saving}
                onClick={() => void handleSave()}
                sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none' }}
                {...contentDiscountLabelButtonPermission('edit', 'Lưu nhãn giảm giá', DISCOUNT_LABEL_SAVE_APIS)}
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </CustomButton>
            }
          />
        </StackRowAlignCenterJustBetween>
      }
    >
      <Box>
        <Stack>
          <StackRowAlignCenter sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <HighlightStatusToggle
              label="Hiển thị tại Thẻ sản phẩm"
              checked={config.displayPercentPlp}
              disabled={viewMode}
              name="displayPercentPlp"
              icon={<Grid01 color={HIGHLIGHT_STATUS_LABEL_COLOR} size={16} />}
              onCheckedChange={(checked) => updateConfig({ displayPercentPlp: checked })}
            />
            <HighlightStatusToggle
              label="Hiển thị tại Trang chi tiết sản phẩm"
              checked={config.displayPercentPdp}
              disabled={viewMode}
              name="displayPercentPdp"
              icon={<ShoppingBag03 color={HIGHLIGHT_STATUS_LABEL_COLOR} size={16} />}
              onCheckedChange={(checked) => updateConfig({ displayPercentPdp: checked })}
            />
          </StackRowAlignCenter>
          <StackRowAlignCenter sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <HighlightStatusToggle
              label="Hiển thị tại Trang giỏ hàng"
              checked={config.displayPercentCart}
              disabled={viewMode}
              name="displayPercentCart"
              icon={<ShoppingBag03 color={HIGHLIGHT_STATUS_LABEL_COLOR} size={16} />}
              onCheckedChange={(checked) => updateConfig({ displayPercentCart: checked })}
            />
          </StackRowAlignCenter>
        </Stack>
      </Box>
    </WrapperComponent>
  );
};

export default DiscountLabelSettingsPage;
