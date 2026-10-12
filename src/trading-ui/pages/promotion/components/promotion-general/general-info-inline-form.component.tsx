import React, { useEffect, useMemo, useState } from 'react';
void React;
import { Box, Stack } from '@mui/material';
import type { PromotionDraft } from '../../../../apis';
import { formatStoredDateTimeDisplay, formatStoredDateTimeNow } from '../../../../common/utils/date-format.util';
import { TextDateInput, TextInput } from '../../../../components/form';
import { CustomButton } from '../../../../components/button';
import { StackRowJustEnd } from '../../../../components/styled';
import { isPromotionHeaderDraftDirty, isPromotionHeaderDraftValid, mapPromotionToHeaderDraft } from '../../promotion.constant';
import { promotionListButtonPermission } from '../../promotion-permission.constants';
import type { HeaderDraftState } from '../../utils/promotion-detail.helpers';
import { ReadonlyField } from './promotion-readonly-field.component';

export const GeneralInfoInlineForm = ({ promotion, editable, saving, onSave }: { promotion: PromotionDraft; editable: boolean; saving: boolean; onSave: (draft: HeaderDraftState) => void }) => {
  const savedDraft = useMemo(() => mapPromotionToHeaderDraft(promotion), [promotion]);
  const [draft, setDraft] = useState<HeaderDraftState>(savedDraft);

  useEffect(() => {
    setDraft(savedDraft);
  }, [savedDraft]);

  const isDirty = isPromotionHeaderDraftDirty(draft, savedDraft);
  const canSave = editable && isDirty && isPromotionHeaderDraftValid(draft) && !saving;

  if (!editable) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
        <ReadonlyField label="Tên chương trình khuyến mãi" value={savedDraft.name} />
        <ReadonlyField label="Mô tả" value={savedDraft.description || '-'} />
        <ReadonlyField label="Ngày bắt đầu" value={formatStoredDateTimeDisplay(savedDraft.startsAtDate)} />
        <ReadonlyField label="Ngày kết thúc" value={formatStoredDateTimeDisplay(savedDraft.endsAtDate)} />
      </Box>
    );
  }

  return (
    <Stack gap={2}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
        <TextInput label="Tên chương trình khuyến mãi" requiredMark disabled={!editable} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
        <TextInput label="Mô tả" disabled={!editable} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
        <TextDateInput
          minDate={formatStoredDateTimeNow()}
          label="Ngày bắt đầu"
          mode="dateTime"
          disabled={!editable}
          value={draft.startsAtDate}
          onChange={(next) => setDraft((current) => ({ ...current, startsAtDate: next }))}
        />
        <TextDateInput
          minDate={formatStoredDateTimeNow()}
          label="Ngày kết thúc"
          mode="dateTime"
          disabled={!editable}
          value={draft.endsAtDate}
          onChange={(next) => setDraft((current) => ({ ...current, endsAtDate: next }))}
        />
      </Box>
      {editable ? (
        <StackRowJustEnd>
          <CustomButton
            fullWidth={false}
            disabled={!canSave}
            onClick={() => onSave(draft)}
            sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none', minWidth: 156, '&:hover': { bgcolor: '#1D2939', boxShadow: 'none' } }}
            {...promotionListButtonPermission('edit', 'Lưu thông tin', 'api_promotion_draft_update')}
          >
            {saving ? 'Đang lưu...' : 'Lưu thông tin'}
          </CustomButton>
        </StackRowJustEnd>
      ) : null}
    </Stack>
  );
};
