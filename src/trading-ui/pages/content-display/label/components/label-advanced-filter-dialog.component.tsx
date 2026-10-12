import { Box, type DialogProps, Stack } from '@mui/material';
import { type MouseEvent, useEffect, useState } from 'react';
import { BadgePosition, BadgeType } from '../../../../apis';
import { SelectInput } from '../../../../components/form/select-input';
import { DialogComponent } from '../../../../components/dialog';

import { RefreshCcw01 } from '@untitledui/icons';
import type { LabelContentAdvancedFilters } from '../label-content/label-content.interface';
import { LABEL_BADGE_STATUS_FILTER_OPTIONS } from '../label-content/label-content.constants';
import { badgePositionLabelVi, LABEL_LIBRARY_BADGE_TYPE_OPTIONS } from '../label-content/label-content.utils';

const BADGE_TYPE_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: BadgeType.TEXT, label: 'TEXT' },
  { value: BadgeType.IMAGE, label: 'IMAGE' },
];

const BADGE_TEMPLATE_TYPE_FILTER_OPTIONS = [{ value: '', label: 'Tất cả' }, ...LABEL_LIBRARY_BADGE_TYPE_OPTIONS];

const BADGE_POSITION_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  ...(Object.values(BadgePosition) as BadgePosition[]).filter((p) => p !== BadgePosition.TOP_CENTER).map((p) => ({ value: p, label: badgePositionLabelVi(p) })),
];

export type LabelAdvancedFilterDialogProps = {
  open: boolean;
  onClose: DialogProps['onClose'];
  value?: LabelContentAdvancedFilters;
  onApply?: (filters: LabelContentAdvancedFilters) => void;
  onReset?: () => void;
};

const emptyFilters: LabelContentAdvancedFilters = {
  status: '',
  type: '',
  badgeType: '',
  defaultPosition: '',
};

export const LabelAdvancedFilterDialog = ({ open, onClose, value = emptyFilters, onApply, onReset }: LabelAdvancedFilterDialogProps) => {
  if (!open) {
    return null;
  }

  return <LabelAdvancedFilterDialogContent onClose={onClose} value={value} onApply={onApply} onReset={onReset} />;
};

type LabelAdvancedFilterDialogContentProps = Pick<LabelAdvancedFilterDialogProps, 'onClose' | 'value' | 'onApply' | 'onReset'>;

const LabelAdvancedFilterDialogContent = ({ onClose, value = emptyFilters, onApply, onReset }: LabelAdvancedFilterDialogContentProps) => {
  const [draft, setDraft] = useState<LabelContentAdvancedFilters>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const setField = <K extends keyof LabelContentAdvancedFilters>(key: K, nextValue: LabelContentAdvancedFilters[K]) => {
    setDraft((current) => ({ ...current, [key]: nextValue }));
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    onReset?.();
  };

  const handleApply = (event: MouseEvent<HTMLButtonElement>) => {
    onApply?.(draft);
    onClose?.(event, 'backdropClick');
  };

  return (
    <DialogComponent
      open
      onClose={onClose}
      title="Bộ lọc nâng cao"
      maxWidth="md"
      fullWidth
      buttonStart={{
        content: 'Đặt lại',
        variant: 'outlined',
        startIcon: <RefreshCcw01 size={24} color="#101828" />,
        onClick: handleReset,
      }}
      buttonLeft={{
        content: 'Hủy',
        variant: 'outlined',
        onClick: () => onClose?.({}, 'backdropClick'),
      }}
      buttonRight={{
        content: 'Áp dụng bộ lọc',
        variant: 'contained',
        onClick: handleApply,
      }}
    >
      <Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: '16px',
          }}
        >
          <SelectInput
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            value={draft.status}
            onChange={(event) => setField('status', event.target.value as LabelContentAdvancedFilters['status'])}
            options={LABEL_BADGE_STATUS_FILTER_OPTIONS}
          />
          <SelectInput
            label="Loại hiển thị (TEXT / IMAGE)"
            placeholder="Chọn loại"
            value={draft.type}
            onChange={(event) => setField('type', event.target.value as LabelContentAdvancedFilters['type'])}
            options={BADGE_TYPE_FILTER_OPTIONS}
          />
          <SelectInput
            label="Phân loại label"
            placeholder="Chọn phân loại"
            value={draft.badgeType}
            onChange={(event) => setField('badgeType', event.target.value as LabelContentAdvancedFilters['badgeType'])}
            options={BADGE_TEMPLATE_TYPE_FILTER_OPTIONS}
          />
          <SelectInput
            label="Vị trí mặc định"
            placeholder="Chọn vị trí"
            value={draft.defaultPosition}
            onChange={(event) => setField('defaultPosition', event.target.value as LabelContentAdvancedFilters['defaultPosition'])}
            options={BADGE_POSITION_FILTER_OPTIONS}
          />
        </Box>
      </Stack>
    </DialogComponent>
  );
};
