import { Box, Stack, Typography } from '@mui/material';
import { SelectAllInput, SelectInput, TextDateInput, TextInput } from '../../../../components/form';
import { isoToStoredDateTime, storedDateTimeToIso } from '../../../../common/utils/date-format.util';
import { type PromotionCostSource, PromotionDraftSchemaType, PromotionSchemaStatus, PromotionScope } from '../../../../apis';
import { PROMOTION_SCHEMA_SCOPE_LABEL, PROMOTION_SCHEMA_TYPE_LABEL } from '../../promotion.constant';
import { SCHEMA_COST_SOURCE_OPTIONS, SCHEMA_TYPE_OPTIONS } from './promotion-schema-header-drawer.constants';
import type { SchemaHeaderDraft, SchemaHeaderParentWindow, SchemaHeaderValidation } from './promotion-schema-header-drawer.types';
import { resolveEarlierStoredDateTime, resolveLaterStoredDateTime, toSchemaHeaderStoredDateTime } from './schema-header-form.utils';
import React, { useMemo } from 'react';
import { HighlightStatusToggle } from '../../../../components/switch/highlight-status-toggle.component';

interface SchemaHeaderFormProps {
  draft: SchemaHeaderDraft;
  validation: SchemaHeaderValidation;
  showValidation: boolean;
  schemaTypeDisabled?: boolean;
  parentWindow?: SchemaHeaderParentWindow | null;
  onDraftChange: (patch: Partial<SchemaHeaderDraft>) => void;
}

const parseCostSourceValues = (raw: unknown): PromotionCostSource[] =>
  (Array.isArray(raw) ? raw.map(String) : []).filter((value): value is PromotionCostSource => SCHEMA_COST_SOURCE_OPTIONS.some((option) => option.value === value));

// File này dùng để hiển thị thông tin đầu của một schema khuyến mãi.
// Kiến thức: scope là bề mặt tính giá; backend khóa nó sau khi schema được tạo.
// Danh sách này phục vụ Markdown để người tạo chọn đúng loại sản phẩm trước khi lưu.
// Sau bước chọn loại schema, giá trị sẽ đi vào create payload và không được đưa vào update payload.
// Khái niệm:
// - scope: phạm vi sản phẩm hoặc bề mặt tính giá mà một ưu đãi được áp dụng.
const MARKDOWN_SCOPE_OPTIONS = [
  { value: PromotionScope.SKU_ITEM, label: PROMOTION_SCHEMA_SCOPE_LABEL[PromotionScope.SKU_ITEM] },
  { value: PromotionScope.BUNDLE, label: PROMOTION_SCHEMA_SCOPE_LABEL[PromotionScope.BUNDLE] },
];

export const SchemaHeaderForm = ({ draft, validation, showValidation, schemaTypeDisabled = false, parentWindow, onDraftChange }: SchemaHeaderFormProps) => {
  const isEnabled = draft.status === PromotionSchemaStatus.ENABLED;
  const schemaTypeLabel = draft.schemaType ? (PROMOTION_SCHEMA_TYPE_LABEL[draft.schemaType as PromotionDraftSchemaType] ?? draft.schemaType) : '';
  const scopeLabel = PROMOTION_SCHEMA_SCOPE_LABEL[draft.scope] ?? draft.scope;

  const parentStartStored = useMemo(() => toSchemaHeaderStoredDateTime(parentWindow?.startsAt), [parentWindow?.startsAt]);
  const parentEndStored = useMemo(() => toSchemaHeaderStoredDateTime(parentWindow?.endsAt), [parentWindow?.endsAt]);
  const methodStartStored = useMemo(() => isoToStoredDateTime(draft.schemaStartsAt), [draft.schemaStartsAt]);
  const methodEndStored = useMemo(() => isoToStoredDateTime(draft.schemaEndsAt), [draft.schemaEndsAt]);

  const startMinDate = parentStartStored || undefined;
  const startMaxDate = resolveEarlierStoredDateTime(parentEndStored || undefined, methodEndStored || undefined);
  const endMinDate = resolveLaterStoredDateTime(parentStartStored || undefined, methodStartStored || undefined);
  const endMaxDate = parentEndStored || undefined;

  return (
    <React.Fragment>
      <Stack sx={{ p: 2 }}>
        <TextInput
          label="Tên hình thức khuyến mãi"
          requiredMark
          value={draft.name}
          onChange={(event) => onDraftChange({ name: event.target.value })}
          placeholder="VD: Giảm 10% cho đơn hàng từ 500K"
          error={showValidation && Boolean(validation.errors.name)}
          errorMessage={validation.errors.name}
        />
        <TextInput
          label="Mô tả"
          value={draft.description}
          onChange={(event) => onDraftChange({ description: event.target.value })}
          placeholder="Giảm 10% giá trị đơn hàng cho đơn hàng đạt giá trị tối thiểu từ 500K trở lên và giảm tối đa 100K"
          multiline
          minRows={2}
        />
        {schemaTypeDisabled ? (
          <TextInput label="Loại hình khuyến mãi" value={schemaTypeLabel} disabled />
        ) : (
          <SelectInput
            label="Loại hình khuyến mãi"
            placeholder="Chọn loại hình khuyến mãi"
            requiredMark
            value={draft.schemaType}
            onChange={(event) => onDraftChange({ schemaType: event.target.value as SchemaHeaderDraft['schemaType'] })}
            options={SCHEMA_TYPE_OPTIONS.filter((item) => !item.disabled)}
            error={showValidation && Boolean(validation.errors.schemaType)}
            errorMessage={validation.errors.schemaType}
          />
        )}

        {draft.schemaType === PromotionDraftSchemaType.MARKDOWN ? (
          schemaTypeDisabled ? (
            <TextInput label="Phạm vi áp dụng" value={scopeLabel} disabled />
          ) : (
            <SelectInput
              label="Phạm vi áp dụng"
              requiredMark
              value={draft.scope}
              onChange={(event) => onDraftChange({ scope: event.target.value as PromotionScope })}
              options={MARKDOWN_SCOPE_OPTIONS}
              placeholder="Chọn phạm vi áp dụng"
            />
          )
        ) : null}

        <SelectAllInput
          label="Nguồn chi phí"
          requiredMark
          value={draft.costSources}
          onChange={(event) => onDraftChange({ costSources: parseCostSourceValues((event.target as EventTarget & { value: unknown }).value) })}
          options={SCHEMA_COST_SOURCE_OPTIONS}
          placeholder="Chọn nguồn chi phí"
          error={showValidation && Boolean(validation.errors.costSources)}
          errorMessage={validation.errors.costSources}
        />
        {draft.schemaType !== PromotionDraftSchemaType.VOUCHER && (
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#344054', mb: 1 }}>Thời gian áp dụng</Typography>
            <Typography sx={{ fontSize: 12, color: '#98A2B3', mb: 1 }}>Để trống nếu thời gian áp dụng trùng với chương trình</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
              <TextDateInput
                label="Ngày bắt đầu"
                mode="dateTime"
                placeholder="Chọn ngày bắt đầu"
                value={methodStartStored}
                onChange={(next) => onDraftChange({ schemaStartsAt: storedDateTimeToIso(next) })}
                minDate={startMinDate}
                maxDate={startMaxDate}
                error={showValidation && Boolean(validation.errors.schemaStartsAt)}
                errorMessage={validation.errors.schemaStartsAt}
              />
              <TextDateInput
                label="Ngày kết thúc"
                mode="dateTime"
                placeholder="Chọn ngày kết thúc"
                value={methodEndStored}
                onChange={(next) => onDraftChange({ schemaEndsAt: storedDateTimeToIso(next) })}
                minDate={endMinDate}
                maxDate={endMaxDate}
                error={showValidation && Boolean(validation.errors.schemaEndsAt)}
                errorMessage={validation.errors.schemaEndsAt}
              />
            </Box>
          </Box>
        )}

        <HighlightStatusToggle
          label="Hiển thị lên website"
          checked={isEnabled}
          onCheckedChange={(next) => onDraftChange({ status: next ? PromotionSchemaStatus.ENABLED : PromotionSchemaStatus.DISABLED })}
        />
      </Stack>
    </React.Fragment>
  );
};
