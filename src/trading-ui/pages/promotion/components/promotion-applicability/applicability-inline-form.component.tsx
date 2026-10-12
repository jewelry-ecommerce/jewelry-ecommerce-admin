import { useEffect, useMemo, useState } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import { promotionApi, type PromotionSalesChannel, StoreSelectionMode, type PromotionApplicabilityConfigV1 } from '../../../../apis';
import { getErrorMessage } from '../../../../common/utils';
import { SelectAllInput, SelectInput } from '../../../../components/form';
import { CustomButton } from '../../../../components/button';
import { StackRowJustEnd } from '../../../../components/styled';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { promotionListButtonPermission } from '../../promotion-permission.constants';
import { ReadonlyField } from '../promotion-general/promotion-readonly-field.component';
import {
  arePromotionApplicabilityFormValuesEqual,
  buildPromotionApplicabilityConfig,
  isPosChannelSelected,
  isPromotionApplicabilityFormSavable,
  mapApplicabilityToFormValues,
  validatePromotionApplicabilityForm,
  type PromotionApplicabilityFormValues,
} from '../../utils/promotion-applicability-form.util';
import {
  APPLICABILITY_CHANNEL_OPTIONS,
  APPLICABILITY_STORE_MODE_OPTIONS,
  PROMOTION_SALES_CHANNEL_LABEL,
  STORE_SELECTION_MODE_LABEL,
  parseMultiSelectValues,
} from './promotion-applicability-form.mapper';
import { formatStoreNames, StorePicker, useStoreNames } from './store-picker.component';

export const ApplicabilityInlineForm = ({
  promotionId,
  initialApplicability,
  editable,
  onSaved,
}: {
  promotionId: string;
  initialApplicability?: PromotionApplicabilityConfigV1 | null;
  editable: boolean;
  onSaved: () => Promise<void> | void;
}) => {
  const { showSnackbar } = useSnackbar();
  const savedValues = useMemo(() => mapApplicabilityToFormValues(initialApplicability), [initialApplicability]);
  const [values, setValues] = useState<PromotionApplicabilityFormValues>(() => savedValues);
  const [saving, setSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    setValues(savedValues);
  }, [savedValues]);

  const posSelected = isPosChannelSelected(values);

  const savedStoreCodes = useMemo(() => [...savedValues.storeCodes, ...savedValues.excludedStoreCodes], [savedValues]);
  const storeNames = useStoreNames(editable ? [] : savedStoreCodes);

  const errors = validatePromotionApplicabilityForm(values);
  const isDirty = !arePromotionApplicabilityFormValuesEqual(values, savedValues);
  const canSave = editable && isDirty && isPromotionApplicabilityFormSavable(values) && !saving;

  const patch = (next: Partial<PromotionApplicabilityFormValues>) => setValues((current) => ({ ...current, ...next }));

  const save = async () => {
    if (!editable || saving) return;
    if (Object.keys(errors).length > 0) {
      setShowValidation(true);
      showSnackbar({ message: Object.values(errors)[0], type: SnackbarType.ERROR });
      return;
    }
    if (!isDirty) return;
    setSaving(true);
    try {
      await promotionApi.upsertPromotionDraftApplicability(promotionId, {
        config: buildPromotionApplicabilityConfig(values),
      });
      await onSaved();
      showSnackbar({ message: 'Đã lưu cấu hình phạm vi áp dụng.', type: SnackbarType.SUCCESS });
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setSaving(false);
    }
  };

  if (!editable) {
    return (
      <Stack gap={1.5}>
        <ReadonlyField label="Kênh bán" value={savedValues.channels.map((c) => PROMOTION_SALES_CHANNEL_LABEL[c]).join(', ')} />
        {isPosChannelSelected(savedValues) && (
          <ReadonlyField
            label="Phạm vi cửa hàng"
            value={
              savedValues.storeMode === StoreSelectionMode.MANUAL
                ? formatStoreNames(savedValues.storeCodes, storeNames)
                : savedValues.storeMode === StoreSelectionMode.GROUP
                  ? `Nhóm: ${savedValues.storeGroupCodes.join(', ')}`
                  : STORE_SELECTION_MODE_LABEL[StoreSelectionMode.ALL]
            }
          />
        )}
        {isPosChannelSelected(savedValues) && savedValues.storeMode !== StoreSelectionMode.MANUAL && savedValues.excludedStoreCodes.length > 0 && (
          <ReadonlyField label="Loại trừ cửa hàng" value={formatStoreNames(savedValues.excludedStoreCodes, storeNames)} />
        )}
      </Stack>
    );
  }

  return (
    <Stack gap={2}>
      <SelectAllInput
        label="Kênh bán"
        requiredMark
        options={APPLICABILITY_CHANNEL_OPTIONS}
        value={values.channels}
        onChange={(event) => patch({ channels: parseMultiSelectValues(event.target.value) as PromotionSalesChannel[] })}
        errorMessage={showValidation ? errors.channels : undefined}
        placeholder="Chọn kênh bán"
      />

      {posSelected && (
        <>
          {values.storeMode === StoreSelectionMode.GROUP ? (
            <Alert severity="warning">
              Chương trình này đang giới hạn theo <strong>nhóm cửa hàng</strong> ({values.storeGroupCodes.join(', ') || '-'}). Danh mục cửa hàng hiện chưa có khái niệm nhóm nên màn hình chưa sửa được
              nhóm; đổi sang &quot;Chọn cụ thể&quot; hoặc &quot;Tất cả cửa hàng&quot; nếu cần thay đổi.
            </Alert>
          ) : null}

          <SelectInput
            label="Phạm vi cửa hàng"
            requiredMark
            options={APPLICABILITY_STORE_MODE_OPTIONS}
            value={values.storeMode === StoreSelectionMode.GROUP ? StoreSelectionMode.ALL : values.storeMode}
            onChange={(event) => patch({ storeMode: event.target.value as StoreSelectionMode, storeGroupCodes: [] })}
          />

          {values.storeMode === StoreSelectionMode.MANUAL && (
            <StorePicker
              label="Cửa hàng áp dụng"
              requiredMark
              value={values.storeCodes}
              onChange={(storeCodes) => patch({ storeCodes })}
              errorMessage={showValidation ? errors.storeCodes : undefined}
              emptyText="Chưa chọn cửa hàng nào — chương trình sẽ không chạy ở đâu cả."
            />
          )}

          {values.storeMode !== StoreSelectionMode.MANUAL && (
            <StorePicker
              label="Loại trừ cửa hàng"
              value={values.excludedStoreCodes}
              onChange={(excludedStoreCodes) => patch({ excludedStoreCodes })}
              errorMessage={showValidation ? errors.excludedStoreCodes : undefined}
              emptyText="Không loại trừ cửa hàng nào"
            />
          )}
        </>
      )}

      {!posSelected && (
        <Typography variant="body2" color="text.secondary">
          Chương trình không bán tại quầy nên không cần giới hạn cửa hàng.
        </Typography>
      )}

      <StackRowJustEnd>
        <CustomButton
          fullWidth={false}
          disabled={!canSave}
          onClick={() => void save()}
          sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none', minWidth: 156, '&:hover': { bgcolor: '#1D2939', boxShadow: 'none' } }}
          {...promotionListButtonPermission('edit', 'Lưu cấu hình', 'api_promotion_draft_update')}
        >
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </CustomButton>
      </StackRowJustEnd>
    </Stack>
  );
};
