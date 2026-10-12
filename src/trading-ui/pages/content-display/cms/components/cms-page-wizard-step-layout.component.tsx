import { Box, Card, CardContent, Typography } from '@mui/material';
import React, { useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import type { Dayjs } from 'dayjs';
import { LayersThree01 } from '@untitledui/icons';
import { type TargetDevice } from '../../../../apis';
import { SelectInput, TextInput } from '../../../../components/form';
import { formLabelSx } from '../../../../components/form/form-field.styles';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackRowAlignCenter } from '../../../../components/styled';
import { CMS_PAGE_TARGET_DEVICE_OPTIONS, SCHEDULE_START_REQUIRED_MESSAGE } from '../cms-page.constants';
import { CmsPageWizardStepActions } from './cms-page-wizard-step-actions.component';

export interface CmsPageWizardStepLayoutProps {
  layoutName: string;
  onLayoutNameChange: (v: string) => void;
  targetDevice: TargetDevice;
  onTargetDeviceChange: (v: TargetDevice) => void;
  scheduleStart: Dayjs | null;
  scheduleEnd: Dayjs | null;
  onScheduleStartChange: (v: Dayjs | null) => void;
  onScheduleEndChange: (v: Dayjs | null) => void;
  onBack: () => void;
  onSave: () => void;
  onContinue: () => void;
  loadingSave: boolean;
  loadingContinue: boolean;
  viewMode?: boolean;
}

const deviceOptions = CMS_PAGE_TARGET_DEVICE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export const CmsPageWizardStepLayout: React.FC<CmsPageWizardStepLayoutProps> = ({
  layoutName,
  onLayoutNameChange,
  targetDevice,
  onTargetDeviceChange,
  scheduleStart,
  scheduleEnd,
  onScheduleStartChange,
  onScheduleEndChange,
  onBack,
  onSave,
  onContinue,
  loadingSave,
  loadingContinue,
  viewMode = false,
}) => {
  const fieldsDisabled = viewMode;
  const [scheduleStartError, setScheduleStartError] = useState<string | null>(null);

  const runIfScheduleStartValid = (action: () => void) => {
    if (viewMode) {
      action();
      return;
    }
    if (!scheduleStart) {
      setScheduleStartError(SCHEDULE_START_REQUIRED_MESSAGE);
      return;
    }
    setScheduleStartError(null);
    action();
  };

  return (
    <React.Fragment>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: '#E5E7EB',
          boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <StackRowAlignCenter sx={{ mb: 2 }}>
            <LayersThree01 size={22} color="#6B7280" />
            <Box sx={{ pl: 1 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>Cấu hình bố cục</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Thiết lập cách hiển thị của trang</Typography>
            </Box>
          </StackRowAlignCenter>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextInput
              label="Tên layout"
              name="layoutName"
              value={layoutName}
              placeholder="VD: Layout mặc định (để trống sẽ tự sinh)"
              onChange={(e) => onLayoutNameChange(e.target.value)}
              disabled={fieldsDisabled}
            />
            <Box sx={{ height: 16 }} />
            <SelectInput
              label="Thiết bị mục tiêu"
              name="targetDevice"
              value={targetDevice}
              onChange={(e) => onTargetDeviceChange(e.target.value as TargetDevice)}
              options={deviceOptions}
              disabled={fieldsDisabled}
            />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5, mb: 2 }}>Layout này sẽ hiển thị trên thiết bị nào</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828', mb: 1 }}>Lên lịch hiển thị (tùy chọn)</Typography>
            <StackRowAlignCenter sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, minWidth: 220, pr: { sm: 1 } }}>
                <Typography sx={formLabelSx}>
                  Bắt đầu
                  {!fieldsDisabled ? (
                    <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
                      *
                    </Box>
                  ) : null}
                </Typography>
                <DateTimePicker
                  value={scheduleStart}
                  onChange={(value) => {
                    onScheduleStartChange(value);
                    if (value) setScheduleStartError(null);
                  }}
                  disabled={fieldsDisabled}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      placeholder: 'Bắt đầu',
                      error: Boolean(scheduleStartError),
                      helperText: scheduleStartError || undefined,
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 220, pl: { sm: 1 } }}>
                <Typography sx={formLabelSx}>Kết thúc</Typography>
                <DateTimePicker value={scheduleEnd} onChange={onScheduleEndChange} disabled={fieldsDisabled} slotProps={{ textField: { fullWidth: true, size: 'small', placeholder: 'Kết thúc' } }} />
              </Box>
            </StackRowAlignCenter>
          </Box>
        </CardContent>
      </Card>

      <CmsPageWizardStepActions
        leftLabel="Quay lại"
        onLeft={onBack}
        onSave={() => runIfScheduleStartValid(onSave)}
        onContinue={() => runIfScheduleStartValid(onContinue)}
        loadingSave={loadingSave}
        loadingContinue={loadingContinue}
        viewMode={viewMode}
      />
    </React.Fragment>
  );
};
