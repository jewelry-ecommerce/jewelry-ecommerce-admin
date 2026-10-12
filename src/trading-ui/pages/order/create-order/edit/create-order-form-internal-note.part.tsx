import { Paper, Typography } from '@mui/material';
import { memo } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { TextInput } from '../../../../components/form';
import type { CreateOrderFormValues } from '../create-order.interface';
import { ORDER_FORM_CARD_SX, ORDER_FORM_SECTION_TITLE_SX } from '../parts/create-order-form.shared';

export interface CreateOrderFormInternalNotePartProps {
  control: Control<CreateOrderFormValues>;
}

export const CreateOrderFormInternalNotePart = memo(function CreateOrderFormInternalNotePart({ control }: CreateOrderFormInternalNotePartProps) {
  return (
    <Paper elevation={0} sx={ORDER_FORM_CARD_SX}>
      <Typography sx={ORDER_FORM_SECTION_TITLE_SX}>Ghi chú nội bộ</Typography>
      <Controller
        control={control}
        name="internalNote"
        render={({ field }) => <TextInput multiline minRows={2} placeholder="Ghi chú nội bộ cho đội vận hành..." value={field.value} onChange={(e) => field.onChange(e.target.value)} />}
      />
    </Paper>
  );
});
