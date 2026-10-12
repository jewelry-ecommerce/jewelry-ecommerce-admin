import { Box, Divider, Stack, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';
import { cmsHeaderFooterApi, isHeaderScheduleConflictResponse, type HeaderScheduleConflictResponse, type HeaderStatus } from '../../../../../../apis';
import { CustomButton } from '../../../../../../components/button/custom-button';
import { contentTopBannerButtonPermission } from '../../../../content-permission.constants';
import { MediaVisibility } from '../../../../../../apis/file/file.enum';
import { getErrorMessage } from '../../../../../../common/utils';
import { uploadSingleImage } from '../../../../../../common/utils/image-upload.utils';
import { TYPOGRAPHY_STYLES } from '../../../../../../common/constant/typography.constant';
import { ColorPaletteField } from '../../../../../../components/color-palette-field/color-palette-field.component';
import { SelectInput, TextInput } from '../../../../../../components/form';
import { formLabelSx, formInputSx } from '../../../../../../components/form/form-field.styles';
import { TextFieldUploadContent as TextFieldUpload } from '../../../../components/text-field-upload-content.component';
import { StackRowAlignCenterJustBetween } from '../../../../../../components/styled/stack.style';
import { DialogConfirmComponent } from '../../../../../../components/dialog';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { TopBannerPreview } from '../../components/top-banner-preview.component';
import {
  BANNER_ANIMATION_OPTIONS,
  BANNER_UPLOAD_ACCEPT,
  BANNER_UPLOAD_HINT,
  BANNER_UPLOAD_MAX_BYTES,
  buildHeaderContentPatchPayload,
  buildHeaderCreatePayload,
  canActivateHeaderStatus,
  DEFAULT_TOP_BANNER_FORM,
} from '../../site-top-banner.constants';
import { SiteTopBannerPageViews } from '../../site-top-banner.enum';
import type { SiteTopBannerGlobalState, TopBannerFormValues } from '../../site-top-banner.interface';

export interface TopBannerFormPartProps {
  viewMode?: boolean;
  screenState: SiteTopBannerGlobalState;
  setScreenState: React.Dispatch<React.SetStateAction<SiteTopBannerGlobalState>>;
}

type PendingStatusChange = {
  headerId: string;
  status: HeaderStatus;
};

type PendingSaveWithActivate = {
  headerId: string;
  contentPayload: ReturnType<typeof buildHeaderContentPatchPayload>;
  contentChanged: boolean;
};

export const TopBannerFormPart: React.FC<TopBannerFormPartProps> = ({ viewMode = false, screenState, setScreenState }) => {
  const { showSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig();
  const isCreate = screenState.view === SiteTopBannerPageViews.CREATE;
  const headerId = screenState.selectedHeaderId;

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [conflict, setConflict] = useState<HeaderScheduleConflictResponse | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange | null>(null);
  const [pendingCreateValues, setPendingCreateValues] = useState<TopBannerFormValues | null>(null);
  const [pendingSaveWithActivate, setPendingSaveWithActivate] = useState<PendingSaveWithActivate | null>(null);
  const [pendingActivate, setPendingActivate] = useState(false);
  const preservePendingActivateRef = useRef(false);

  const { data: headerDetail } = useSWR(!isCreate && headerId ? ['cms/admin/headers', headerId] : null, () => cmsHeaderFooterApi.getHeaderDetail(headerId!), { revalidateOnFocus: false });

  const { control, handleSubmit, reset, watch } = useForm<TopBannerFormValues>({
    defaultValues: DEFAULT_TOP_BANNER_FORM,
  });

  const watched = watch();

  useEffect(() => {
    if (isCreate) {
      reset(DEFAULT_TOP_BANNER_FORM);
      setPendingActivate(false);
      return;
    }
    if (!headerDetail || headerDetail.id !== headerId) return;

    reset({
      bannerName: headerDetail.bannerName,
      bannerDisplayStyle: headerDetail.bannerDisplayStyle,
      bannerContent: headerDetail.bannerContent ?? '',
      bannerBgColor: headerDetail.bannerBgColor ?? '#D4E157',
      bannerTextColor: headerDetail.bannerTextColor ?? '#101828',
      bannerTargetUrl: headerDetail.bannerTargetUrl ?? '/',
      bannerAnimationStyle: headerDetail.bannerAnimationStyle ?? 'STATIC',
      bannerLoopIntervalSec: headerDetail.bannerLoopIntervalSec ?? 15,
      bannerStartTime: dayjs(headerDetail.bannerStartTime),
      bannerEndTime: headerDetail.bannerEndTime ? dayjs(headerDetail.bannerEndTime) : null,
      status: headerDetail.status,
    });

    if (preservePendingActivateRef.current) {
      preservePendingActivateRef.current = false;
      return;
    }

    setPendingActivate(canActivateHeaderStatus(headerDetail));
  }, [isCreate, headerDetail, headerId, reset]);

  const closePanel = () => setScreenState({ view: SiteTopBannerPageViews.LIST, selectedHeaderId: undefined });

  const validateForm = (values: TopBannerFormValues): string | null => {
    if (!values.bannerName.trim()) return 'Vui lòng nhập tên top banner.';
    if (!values.bannerStartTime) return 'Vui lòng chọn thời gian bắt đầu.';
    if (values.bannerEndTime && !values.bannerEndTime.isAfter(values.bannerStartTime)) {
      return 'Thời gian kết thúc phải sau thời gian bắt đầu.';
    }
    if (!values.bannerContent.trim()) {
      if (values.bannerDisplayStyle === 'MEDIA') {
        return 'Vui lòng tải hình ảnh/video cho top banner.';
      }
      return 'Vui lòng nhập nội dung văn bản.';
    }
    return null;
  };

  const applyStatusChange = async (id: string, status: HeaderStatus, confirmReplaceActive = false) => {
    const response = await cmsHeaderFooterApi.patchHeaderStatus(id, {
      status,
      ...(confirmReplaceActive ? { confirmReplaceActive: true } : {}),
    });
    if (isHeaderScheduleConflictResponse(response)) {
      setPendingStatusChange({ headerId: id, status });
      setConflict(response);
      return false;
    }
    return true;
  };

  const clearPendingActivateFlow = () => {
    setPendingSaveWithActivate(null);
    setPendingStatusChange(null);
  };

  const onSubmit: SubmitHandler<TopBannerFormValues> = async (values) => {
    const validationError = validateForm(values);
    if (validationError) {
      showSnackbar({ type: SnackbarType.ERROR, message: validationError });
      return;
    }

    setSaving(true);
    try {
      if (isCreate) {
        const response = await cmsHeaderFooterApi.postHeader(buildHeaderCreatePayload(values));
        if (isHeaderScheduleConflictResponse(response)) {
          setPendingCreateValues(values);
          setConflict(response);
          return;
        }
        const newId = response.data?.id ?? response.id;
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã tạo top banner.' });
        await mutate('cms/admin/headers');
        if (newId) {
          preservePendingActivateRef.current = true;
          setPendingActivate(true);
          setScreenState({ view: SiteTopBannerPageViews.UPDATE, selectedHeaderId: newId });
        } else {
          closePanel();
        }
      } else if (headerId && headerDetail) {
        const contentPayload = buildHeaderContentPatchPayload(values, headerDetail);
        const contentChanged = Object.keys(contentPayload).length > 0;

        if (!contentChanged) {
          showSnackbar({ type: SnackbarType.INFO, message: 'Không có thay đổi.' });
          return;
        }

        await cmsHeaderFooterApi.patchHeader(headerId, contentPayload);
        preservePendingActivateRef.current = true;
        setPendingActivate(canActivateHeaderStatus(headerDetail));
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã lưu thay đổi.' });
        await mutate('cms/admin/headers');
        await mutate(['cms/admin/headers', headerId]);
      }
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!headerId) return;
    setPublishing(true);
    try {
      if (pendingSaveWithActivate?.headerId === headerId && pendingSaveWithActivate.contentChanged) {
        await cmsHeaderFooterApi.patchHeader(headerId, pendingSaveWithActivate.contentPayload);
      }

      const ok = await applyStatusChange(headerId, 'ACTIVE');
      if (!ok) return;

      setPendingActivate(false);
      setPendingSaveWithActivate(null);
      setPendingStatusChange(null);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã kích hoạt top banner.' });
      setPublishOpen(false);
      await mutate('cms/admin/headers');
      await mutate(['cms/admin/headers', headerId]);
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setPublishing(false);
    }
  };

  const handleConfirmConflictReplace = async () => {
    setSaving(true);
    try {
      if (pendingCreateValues) {
        const response = await cmsHeaderFooterApi.postHeader(buildHeaderCreatePayload(pendingCreateValues, true));
        if (isHeaderScheduleConflictResponse(response)) {
          setConflict(response);
          return;
        }
        const newId = response.data?.id ?? response.id;
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã tạo và kích hoạt top banner.' });
        await mutate('cms/admin/headers');
        setPendingCreateValues(null);
        setConflict(null);
        if (newId) {
          setScreenState({ view: SiteTopBannerPageViews.UPDATE, selectedHeaderId: newId });
        } else {
          closePanel();
        }
        return;
      }

      if (pendingStatusChange) {
        if (pendingSaveWithActivate?.headerId === pendingStatusChange.headerId && pendingSaveWithActivate.contentChanged) {
          await cmsHeaderFooterApi.patchHeader(pendingStatusChange.headerId, pendingSaveWithActivate.contentPayload);
        }

        const ok = await applyStatusChange(pendingStatusChange.headerId, pendingStatusChange.status, true);
        if (!ok) return;
        if (headerDetail) {
          setPendingActivate(canActivateHeaderStatus({ ...headerDetail, status: pendingStatusChange.status }));
        }
        setPendingSaveWithActivate(null);
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Kích hoạt top banner thành công.' });
        await mutate('cms/admin/headers');
        await mutate(['cms/admin/headers', pendingStatusChange.headerId]);
        setPendingStatusChange(null);
        setConflict(null);
        setPublishOpen(false);
      }
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const clearConflict = () => {
    setConflict(null);
    setPendingCreateValues(null);
    clearPendingActivateFlow();
  };

  const panelTitle = isCreate ? 'Tạo top banner mới' : `Chi tiết: ${headerDetail?.bannerName ?? ''}`;
  const fieldsDisabled = viewMode;

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <StackRowAlignCenterJustBetween sx={{ mb: 2, flexShrink: 0 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>{panelTitle}</Typography>
        {!viewMode ? (
          <Stack direction="row" gap={1}>
            <CustomButton type="button" variant="outline" fullWidth={false} onClick={closePanel} disabled={saving}>
              Hủy
            </CustomButton>
            <CustomButton
              type="button"
              variant="primary"
              fullWidth={false}
              onClick={() => void handleSubmit(onSubmit)()}
              disabled={saving}
              sx={{ bgcolor: '#101828', boxShadow: 'none', '&:hover': { bgcolor: '#101828' } }}
              {...contentTopBannerButtonPermission('top_banner_save', 'Lưu', 'api_cms_header_update')}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </CustomButton>
            {!isCreate ? (
              <CustomButton
                type="button"
                variant="primary"
                fullWidth={false}
                onClick={() => {
                  setPendingStatusChange({ headerId: headerId!, status: 'ACTIVE' });
                  setPublishOpen(true);
                }}
                disabled={!pendingActivate || publishing}
                sx={{
                  bgcolor: pendingActivate ? '#039855' : '#D0D5DD',
                  boxShadow: 'none',
                  color: pendingActivate ? '#FFFFFF' : '#667085',
                  '&:hover': { bgcolor: pendingActivate ? '#039855' : '#D0D5DD' },
                  '&:disabled': { bgcolor: '#D0D5DD', color: '#667085' },
                }}
                {...contentTopBannerButtonPermission('top_banner_activate', 'Kích hoạt', 'api_cms_header_update')}
              >
                Kích hoạt
              </CustomButton>
            ) : null}
          </Stack>
        ) : (
          <CustomButton type="button" variant="outline" fullWidth={false} onClick={closePanel}>
            Đóng
          </CustomButton>
        )}
      </StackRowAlignCenterJustBetween>

      <Stack component="form" onSubmit={(e) => void handleSubmit(onSubmit)(e)} sx={{ flex: 1, minHeight: 0, overflow: 'auto', gap: 2, pr: 0.5 }}>
        <TopBannerPreview bannerDisplayStyle={watched.bannerDisplayStyle} bannerContent={watched.bannerContent} bannerBgColor={watched.bannerBgColor} bannerTextColor={watched.bannerTextColor} />

        <Controller
          name="bannerName"
          control={control}
          render={({ field }) => <TextInput label="Tên bản cấu hình" requiredMark disabled={fieldsDisabled} value={field.value} onChange={field.onChange} />}
        />

        {watched.bannerDisplayStyle === 'MEDIA' ? (
          <Controller
            name="bannerContent"
            control={control}
            render={({ field }) => (
              <TextFieldUpload
                label="File hình ảnh/video"
                requiredMark
                disabled={fieldsDisabled}
                value={field.value}
                onChange={field.onChange}
                onPickFile={async (file) => {
                  try {
                    const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
                    field.onChange(asset?.publicUrl ?? '');
                  } catch (err) {
                    showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) });
                  }
                }}
                accept={BANNER_UPLOAD_ACCEPT}
                maxFileSizeBytes={BANNER_UPLOAD_MAX_BYTES}
                previewMode="image"
                hintText={BANNER_UPLOAD_HINT}
                onFileReject={(reason) => showSnackbar({ type: SnackbarType.ERROR, message: reason })}
              />
            )}
          />
        ) : (
          <Controller
            name="bannerContent"
            control={control}
            render={({ field }) => <TextInput label="Nội dung văn bản" requiredMark disabled={fieldsDisabled} value={field.value} onChange={field.onChange} placeholder="Khám phá Heartlock Society" />}
          />
        )}

        {watched.bannerDisplayStyle === 'TEXT' && (
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Controller
                name="bannerBgColor"
                control={control}
                render={({ field }) => <ColorPaletteField label="Màu nền" disabled={fieldsDisabled} value={field.value} onChange={field.onChange} />}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Controller
                name="bannerTextColor"
                control={control}
                render={({ field }) => <ColorPaletteField label="Màu chữ" disabled={fieldsDisabled} value={field.value} onChange={field.onChange} />}
              />
            </Box>
          </Stack>
        )}

        <Controller
          name="bannerTargetUrl"
          control={control}
          render={({ field }) => <TextInput label="Đường dẫn khi nhấn top banner" disabled={fieldsDisabled} value={field.value} onChange={field.onChange} placeholder="/" />}
        />

        <Controller
          name="bannerAnimationStyle"
          control={control}
          render={({ field }) => <SelectInput label="Hiệu ứng" disabled={fieldsDisabled} value={field.value} onChange={(e) => field.onChange(e.target.value)} options={BANNER_ANIMATION_OPTIONS} />}
        />

        <Controller
          name="bannerLoopIntervalSec"
          control={control}
          render={({ field }) => (
            <TextInput label="Chu kỳ lặp (giây)" type="number" disabled={fieldsDisabled} value={String(field.value)} onChange={(e) => field.onChange(Number(e.target.value) || 15)} />
          )}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={formLabelSx}>
              Thời gian bắt đầu
              <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
                *
              </Box>
            </Typography>
            <Controller
              name="bannerStartTime"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={fieldsDisabled}
                  format="DD/MM/YYYY HH:mm"
                  slotProps={{
                    textField: { fullWidth: true, size: 'small', placeholder: 'dd/mm/yyyy hh:mm', disabled: fieldsDisabled, sx: formInputSx },
                  }}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={formLabelSx}>Thời gian kết thúc</Typography>
            <Controller
              name="bannerEndTime"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={fieldsDisabled}
                  format="DD/MM/YYYY HH:mm"
                  minDateTime={watched.bannerStartTime ?? undefined}
                  slotProps={{
                    textField: { fullWidth: true, size: 'small', placeholder: 'Không giới hạn', disabled: fieldsDisabled, sx: formInputSx },
                  }}
                />
              )}
            />
          </Box>
        </Stack>
      </Stack>

      <DialogConfirmComponent
        open={publishOpen}
        onClose={() => {
          setPublishOpen(false);
          clearPendingActivateFlow();
        }}
        title="Kích hoạt top banner"
        cancelLabel="Huỷ"
        confirmLabel="Kích hoạt"
        onCancel={() => {
          setPublishOpen(false);
          clearPendingActivateFlow();
        }}
        onConfirm={() => void handlePublish()}
        loading={publishing}
        confirmVariant="primary"
        highlight={{
          tone: 'info',
          title: 'Hiển thị top banner trên website E-commerce?',
          description: 'Top banner sẽ hiển thị khi trong khung thời gian và không có bản đang chạy khác trùng lịch (hoặc sau khi xác nhận ghi đè).',
        }}
      />

      <DialogConfirmComponent
        open={Boolean(conflict)}
        onClose={clearConflict}
        title="Trùng lịch hiển thị top banner"
        highlight={{
          tone: 'danger',
          title: conflict?.message ?? 'Đã có top banner đang chạy trùng khung thời gian.',
          description: conflict?.conflictingHeaders?.length ? `Bản trùng: ${conflict.conflictingHeaders.map((item) => item.bannerName).join(', ')}` : undefined,
        }}
        cancelLabel="Hủy"
        confirmLabel="Xác nhận ghi đè"
        onCancel={clearConflict}
        onConfirm={() => void handleConfirmConflictReplace()}
        loading={saving || publishing}
      >
        <Divider />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Hệ thống sẽ ngừng các top banner đang chạy trùng lịch rồi áp dụng bản này.</Typography>
      </DialogConfirmComponent>
    </Stack>
  );
};
