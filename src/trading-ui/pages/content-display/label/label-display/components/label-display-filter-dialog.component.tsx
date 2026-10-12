import { type DialogProps } from '@mui/material';
import { type MouseEvent, useEffect, useState } from 'react';
import { RefreshCcw01 } from '@untitledui/icons';
import { BadgeCampaignDisplayStatus } from '../../../../../apis';
import { SelectInput } from '../../../../../components/form/select-input';
import { DialogComponent } from '../../../../../components/dialog';
import { contentLabelDisplayButtonPermission } from '../../../content-permission.constants';
import { getBadgeCampaignDisplayStatusLabelVi } from '../../label-content/label-content.constants';

export type LabelDisplayFilterValue = {
  displayStatus: BadgeCampaignDisplayStatus | '';
};

export const countActiveLabelDisplayFilters = (filters: LabelDisplayFilterValue): number => [Boolean(filters.displayStatus)].filter(Boolean).length;

const emptyFilters: LabelDisplayFilterValue = {
  displayStatus: '',
};

const DISPLAY_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  ...[BadgeCampaignDisplayStatus.DRAFT, BadgeCampaignDisplayStatus.SCHEDULED, BadgeCampaignDisplayStatus.RUNNING, BadgeCampaignDisplayStatus.PAUSED, BadgeCampaignDisplayStatus.ENDED].map((value) => ({
    value,
    label: getBadgeCampaignDisplayStatusLabelVi(value),
  })),
];

export type LabelDisplayFilterDialogProps = {
  open: boolean;
  onClose: DialogProps['onClose'];
  value?: LabelDisplayFilterValue;
  onApply?: (filters: LabelDisplayFilterValue) => void;
  onReset?: () => void;
};

export const LabelDisplayFilterDialog = ({ open, onClose, value = emptyFilters, onApply, onReset }: LabelDisplayFilterDialogProps) => {
  const [draft, setDraft] = useState<LabelDisplayFilterValue>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleReset = () => {
    setDraft(emptyFilters);
    onReset?.();
  };

  const handleApply = (event: MouseEvent<HTMLButtonElement>) => {
    onApply?.(draft);
    onClose?.(event, 'backdropClick');
  };

  if (!open) return null;

  return (
    <DialogComponent
      open
      onClose={onClose}
      title="Bộ lọc"
      maxWidth="sm"
      fullWidth
      buttonStart={{
        content: 'Đặt lại',
        variant: 'outlined',
        startIcon: <RefreshCcw01 size={24} color="#101828" />,
        onClick: handleReset,
        ...contentLabelDisplayButtonPermission('label_display_filter_reset', 'Đặt lại bộ lọc label display', 'api_cms_page_list'),
      }}
      buttonLeft={{
        content: 'Hủy',
        variant: 'outlined',
        onClick: () => onClose?.({}, 'backdropClick'),
        ...contentLabelDisplayButtonPermission('label_display_filter_cancel', 'Hủy bộ lọc label display', 'api_cms_page_list'),
      }}
      buttonRight={{
        content: 'Áp dụng bộ lọc',
        variant: 'contained',
        onClick: handleApply,
        ...contentLabelDisplayButtonPermission('label_display_filter_apply', 'Áp dụng bộ lọc label display', 'api_cms_page_list'),
      }}
    >
      <SelectInput
        label="Trạng thái hiển thị"
        placeholder="Chọn trạng thái"
        value={draft.displayStatus}
        onChange={(event) => setDraft({ displayStatus: event.target.value as LabelDisplayFilterValue['displayStatus'] })}
        options={DISPLAY_STATUS_FILTER_OPTIONS}
      />
    </DialogComponent>
  );
};
