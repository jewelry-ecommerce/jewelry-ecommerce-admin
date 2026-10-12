import { Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { STYLE } from '@/trading-ui/adapters/library';
import { cmsHeaderFooterApi } from '../../../../apis';
import { getErrorMessage } from '../../../../common/utils';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../components/button/custom-button';
import { contentLogoButtonPermission } from '../../content-permission.constants';
import { ContentSettingsEditToolbar } from '../../components/content-settings-edit-toolbar.component';
import { useContentSettingsViewMode } from '../../hooks/use-content-settings-view-mode.hook';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { WrapperComponent } from '../../../../components/wrapper';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { LogoSlotRow } from './components/logo-slot-row.component';
import { buildLogoSlotForms, LOGO_SLOT_TYPES } from './site-logo.constants';
import type { LogoSlotFormValues } from './site-logo.interface';

type LogoFormErrors = Record<string, string>;

const buildSlotErrorKey = (type: string, field: 'name' | 'logoUrl') => `slots.${type}.${field}`;

const validateLogoSlots = (slots: LogoSlotFormValues[]): LogoFormErrors => {
  const errors: LogoFormErrors = {};

  slots.forEach((slot) => {
    if (!slot.logoUrl.trim()) {
      errors[buildSlotErrorKey(slot.type, 'logoUrl')] = 'Vui lòng tải logo';
    }
    if (slot.type !== 'FAVICON' && !slot.name.trim()) {
      errors[buildSlotErrorKey(slot.type, 'name')] = 'Vui lòng nhập tên bản cấu hình';
    }
  });

  return errors;
};

const SiteLogoPage = () => {
  const { showSnackbar } = useSnackbar();
  const [slots, setSlots] = useState<LogoSlotFormValues[]>([]);
  const [formErrors, setFormErrors] = useState<LogoFormErrors>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const snapshotRef = useRef<LogoSlotFormValues[]>([]);

  const { data, isLoading, mutate } = useSWR('cms/admin/logos', () => cmsHeaderFooterApi.getLogoList({ take: 100, isPagination: false }), {
    revalidateOnFocus: false,
  });

  const resetFromServer = useCallback(() => {
    if (!data?.list) return;
    const next = buildLogoSlotForms(data.list);
    snapshotRef.current = next;
    setSlots(next);
    setDirty(false);
    setFormErrors({});
  }, [data?.list]);

  const { viewMode, enterEditMode, cancelEditMode, exitEditModeAfterSave } = useContentSettingsViewMode(resetFromServer);

  useEffect(() => {
    resetFromServer();
  }, [resetFromServer]);

  const hasChanges = useMemo(() => {
    if (!data?.list) return dirty;
    const initial = buildLogoSlotForms(data.list);
    return dirty || JSON.stringify(initial) !== JSON.stringify(slots);
  }, [data?.list, dirty, slots]);

  const updateSlot = (type: LogoSlotFormValues['type'], patch: Partial<LogoSlotFormValues>) => {
    Object.keys(patch).forEach((field) => {
      const errorKey = buildSlotErrorKey(type, field as 'name' | 'logoUrl');
      setFormErrors((prev) => {
        if (!prev[errorKey]) return prev;
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    });

    setSlots((prev) => prev.map((slot) => (slot.type === type ? { ...slot, ...patch } : slot)));
    setDirty(true);
  };

  const saveSlot = async (slot: LogoSlotFormValues) => {
    const payload = {
      name: slot.name.trim() || LOGO_SLOT_TYPES.find((type) => type === slot.type) || slot.type,
      type: slot.type,
      logoUrl: slot.logoUrl.trim(),
      logoTargetUrl: '/',
    };

    if (slot.logoId) {
      await cmsHeaderFooterApi.patchLogo(slot.logoId, payload);
      await cmsHeaderFooterApi.patchLogoStatus(slot.logoId, { status: 'ACTIVE' });
      return slot.logoId;
    }

    const created = await cmsHeaderFooterApi.postLogo({ ...payload, status: 'DRAFT' });
    const newId = created.data?.id ?? created.id;
    if (!newId) {
      throw new Error('Không tạo được logo.');
    }

    await cmsHeaderFooterApi.patchLogoStatus(newId, { status: 'ACTIVE' });
    return newId;
  };

  const handleSave = useCallback(async () => {
    const validationErrors = validateLogoSlots(slots);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      showSnackbar({ type: SnackbarType.ERROR, message: 'Vui lòng kiểm tra lại các trường bắt buộc.' });
      return;
    }

    setSaving(true);
    try {
      const nextSlots = [...slots];
      for (let index = 0; index < nextSlots.length; index += 1) {
        const slot = nextSlots[index];
        const logoId = await saveSlot(slot);
        nextSlots[index] = { ...slot, logoId };
      }

      setSlots(nextSlots);
      setDirty(false);
      setFormErrors({});
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã lưu cấu hình logo.' });
      await mutate();
      exitEditModeAfterSave();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  }, [exitEditModeAfterSave, mutate, showSnackbar, slots]);

  if (isLoading && slots.length === 0) {
    return (
      <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)` }}>
        <WrapperComponent label="Quản lý logo">
          <LoadingComponent />
        </WrapperComponent>
      </Stack>
    );
  }

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0 }}>
      <WrapperComponent
        label="Quản lý logo"
        nodeLabel={
          <StackRowAlignCenterJustBetween sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E5E7EB' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Cập nhật logo theo 4 vị trí cố định trên website E-commerce.</Typography>
            <ContentSettingsEditToolbar
              viewMode={viewMode}
              onEnterEdit={enterEditMode}
              onCancelEdit={cancelEditMode}
              editPermission={contentLogoButtonPermission('logo_edit', 'Chỉnh sửa logo', 'api_cms_logo_update')}
              cancelPermission={contentLogoButtonPermission('logo_edit', 'Hủy chỉnh sửa logo', 'api_cms_logo_update')}
              editActions={
                <CustomButton
                  type="button"
                  variant="primary"
                  fullWidth={false}
                  disabled={!hasChanges || saving}
                  onClick={() => void handleSave()}
                  sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none' }}
                  {...contentLogoButtonPermission('logo_save', 'Lưu logo', 'api_cms_logo_update')}
                >
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </CustomButton>
              }
            />
          </StackRowAlignCenterJustBetween>
        }
      >
        <Stack sx={{ flex: 1, minHeight: 0, overflow: 'auto', py: 2, gap: 2, width: '100%' }}>
          {slots.map((slot) => (
            <LogoSlotRow
              key={slot.type}
              slot={slot}
              disabled={viewMode}
              nameError={formErrors[buildSlotErrorKey(slot.type, 'name')]}
              logoError={formErrors[buildSlotErrorKey(slot.type, 'logoUrl')]}
              onChange={(patch) => updateSlot(slot.type, patch)}
            />
          ))}
        </Stack>
      </WrapperComponent>
    </Stack>
  );
};

export default SiteLogoPage;
