import { Grid, Stack } from '@mui/material';
import { useState } from 'react';
import { DialogComponent } from '../../../../../../components/dialog';
import { QuantityNumberSpinner, SelectInput } from '../../../../../../components/form';

interface LabelContentDialogUpdatePartProps {
  open: boolean;
  onClose: () => void;
}

export const LabelContentDialogUpdatePart = ({ open, onClose }: LabelContentDialogUpdatePartProps) => {
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');
  const [priority, setPriority] = useState(1);

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      title="Chỉnh sửa Label"
      buttonLeft={{
        content: 'Huỷ',
        variant: 'outlined',
        onClick: onClose,
      }}
      buttonRight={{
        content: 'Lưu',
        variant: 'contained',
        onClick: onClose,
      }}
    >
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectInput
              label="Loại Label"
              name="type"
              value={type}
              placeholder="Chọn loại label"
              options={[
                { value: 'bestSeller', label: 'Bán chạy' },
                { value: 'new', label: 'Mới' },
                { value: 'campaign', label: 'Campaign' },
              ]}
              onChange={(e) => setType(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectInput
              label="Tên Label"
              name="name"
              value={name}
              placeholder="Chọn tên label"
              options={[
                { value: 'label_sale', label: 'Sale' },
                { value: 'label_new', label: 'Mới' },
                { value: 'label_campaign', label: 'Campaign' },
              ]}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectInput
              label="Trạng thái"
              name="status"
              value={status}
              requiredMark
              placeholder="Chọn trạng thái"
              options={[
                { value: 'active', label: 'Kích hoạt' },
                { value: 'inactive', label: 'Ngừng kích hoạt' },
              ]}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <QuantityNumberSpinner value={priority} max={100} onCommit={(value) => setPriority(value)} />
          </Grid>
        </Grid>
      </Stack>
    </DialogComponent>
  );
};
