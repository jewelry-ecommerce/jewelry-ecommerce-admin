import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Stack, Typography } from '@mui/material';
import { type BaseSyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import { CustomButton } from '../../components/button';
import { promotionApi } from '../../apis';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { getErrorMessage } from '../../common/utils';
import { formatStoredDateTimeNow, normalizeStoredDateTimeInput, parseStoredDateTime, storedDateTimeToIso } from '../../common/utils/date-format.util';
import { dialogContainedButtonSx, dialogOutlinedButtonSx } from '../../components/dialog/dialog.component';
import { TextInput } from '../../components/form/text-input';
import { StackRowAlignCenterJustBetween, StackRowJustEnd } from '../../components/styled';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { ROUTE_PATH, getPromotionUpdatePath } from '@/trading-ui/router/route.path';
import { LabelFormPageHeader } from '../content-display/label/components';
import { ProductSpuSectionPanel } from '../product/product-spu/components/product-spu-page-sections.component';
import {
  PROMOTION_CREATE_FORM_STORAGE_KEY,
  createDefaultPromotionHeaderFormValues,
  getPromotionDetailSectionIcon,
  promotionHeaderFormSchema,
  type PromotionHeaderFormValues,
} from './promotion.constant';
import { promotionListButtonPermission } from './promotion-permission.constants';
import { TextDateInput } from '../../components/form';

const GeneralSectionIcon = getPromotionDetailSectionIcon('general');

const PromotionCreatePage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<PromotionHeaderFormValues>({
    resolver: yupResolver(promotionHeaderFormSchema),
    mode: 'onSubmit',
    defaultValues: createDefaultPromotionHeaderFormValues(),
  });

  const startsAtDate = useWatch({ control, name: 'startsAtDate' });
  const endsAtDate = useWatch({ control, name: 'endsAtDate' });

  useEffect(() => {
    const saved = window.localStorage.getItem(PROMOTION_CREATE_FORM_STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<PromotionHeaderFormValues>;
      const defaults = createDefaultPromotionHeaderFormValues();
      reset({
        ...defaults,
        ...parsed,
        startsAtDate: normalizeStoredDateTimeInput(parsed.startsAtDate ?? ''),
        endsAtDate: normalizeStoredDateTimeInput(parsed.endsAtDate ?? ''),
      });
    } catch {
      reset(createDefaultPromotionHeaderFormValues());
    }
  }, [reset]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = watch((values) => {
      window.localStorage.setItem(PROMOTION_CREATE_FORM_STORAGE_KEY, JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const durationInDays = useMemo(() => {
    if (!startsAtDate || !endsAtDate) return 0;
    const start = parseStoredDateTime(startsAtDate);
    const end = parseStoredDateTime(endsAtDate);
    if (!start || !end) return 0;
    return Math.max(0, Math.ceil(end.diff(start, 'day', true)));
  }, [endsAtDate, startsAtDate]);

  const onSubmit: SubmitHandler<PromotionHeaderFormValues> = async (values) => {
    setSaving(true);
    try {
      const promotionDraft = await promotionApi.createPromotionDraft({
        name: values.name.trim(),
        description: values.description.trim() || null,
        startsAt: storedDateTimeToIso(values.startsAtDate),
        endsAt: storedDateTimeToIso(values.endsAtDate, true),
      });
      window.localStorage.removeItem(PROMOTION_CREATE_FORM_STORAGE_KEY);
      navigate(getPromotionUpdatePath(promotionDraft.id));
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setSaving(false);
    }
  };

  const handleFormSubmit = useCallback(
    (event?: BaseSyntheticEvent) => {
      void handleSubmit(onSubmit)(event);
    },
    [handleSubmit, onSubmit],
  );

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
        bgcolor: '#F9FAFB',
        gap: 0,
      }}
    >
      <LabelFormPageHeader variant="backOnly" onBack={() => navigate(ROUTE_PATH.PROMOTION)} />

      <StackRowAlignCenterJustBetween sx={{ px: 3, py: 2, gap: 1.5, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>Tạo chương trình khuyến mãi</Typography>
        <StackRowJustEnd gap={1}>
          <CustomButton variant="outline" fullWidth={false} onClick={() => navigate(ROUTE_PATH.PROMOTION)} sx={dialogOutlinedButtonSx}>
            Hủy
          </CustomButton>
          <CustomButton
            fullWidth={false}
            onClick={() => void handleFormSubmit()}
            disabled={saving}
            sx={dialogContainedButtonSx}
            {...promotionListButtonPermission('create', 'Lưu thông tin chung', 'api_promotion_draft_create')}
          >
            {saving ? 'Đang lưu...' : 'Lưu thông tin chung'}
          </CustomButton>
        </StackRowJustEnd>
      </StackRowAlignCenterJustBetween>

      <Stack sx={{ flex: 1, minHeight: 0, p: 3, overflowY: 'auto', alignItems: 'flex-start' }}>
        <Stack
          component="form"
          noValidate
          onSubmit={(event) => {
            void handleFormSubmit(event);
          }}
          sx={{ width: '100%', gap: 2 }}
        >
          <ProductSpuSectionPanel title="Thông tin chung" icon={<GeneralSectionIcon size={20} color="#737373" />}>
            <Stack gap={3}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Tên chương trình khuyến mãi"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      placeholder="Black Friday - Giảm giá 50%"
                      requiredMark
                      error={Boolean(fieldState.error)}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Mô tả"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      placeholder="Giảm giá 50% nhân dịp Black Friday cho tất cả sản phẩm."
                      error={Boolean(fieldState.error)}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>
                <Controller
                  name="startsAtDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextDateInput
                      minDate={formatStoredDateTimeNow()}
                      mode="dateTime"
                      label="Ngày bắt đầu"
                      value={field.value}
                      onChange={(next) => field.onChange(next)}
                      onBlur={field.onBlur}
                      error={Boolean(fieldState.error)}
                      errorMessage={fieldState.error?.message}
                      requiredMark
                    />
                  )}
                />
                <Controller
                  name="endsAtDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextDateInput
                      minDate={formatStoredDateTimeNow()}
                      mode="dateTime"
                      label="Ngày kết thúc"
                      value={field.value}
                      onChange={(next) => field.onChange(next)}
                      onBlur={field.onBlur}
                      error={Boolean(fieldState.error)}
                      errorMessage={fieldState.error?.message}
                      requiredMark
                    />
                  )}
                />
              </Box>

              {durationInDays > 0 ? <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Chương trình dự kiến kéo dài {durationInDays} ngày.</Typography> : null}
            </Stack>
          </ProductSpuSectionPanel>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default PromotionCreatePage;
