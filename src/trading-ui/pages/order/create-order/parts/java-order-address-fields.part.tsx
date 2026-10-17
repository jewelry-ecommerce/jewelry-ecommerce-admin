import { Controller, type Control } from 'react-hook-form';
import { StackRow } from '../../../../components/styled';
import { TextInput } from '../../../../components/form';
import type { CreateOrderFormValues } from '../create-order.interface';

const ADDRESS_FIELDS = [{ name: 'provinceName', label: 'Tỉnh/Thành phố' }, { name: 'wardName', label: 'Phường/Xã' }] as const;
export function JavaOrderAddressFields({ control }: { control: Control<CreateOrderFormValues> }) {
  return <StackRow gap={2}>{ADDRESS_FIELDS.map(({ name, label }) => <Controller key={name} name={name} control={control}
    rules={{ required: 'Vui lòng nhập ' + label, validate: value => Boolean(value?.trim()) || 'Vui lòng nhập ' + label }}
    render={({ field, fieldState }) => <TextInput requiredMark label={label} value={field.value ?? ''}
      onChange={field.onChange} error={Boolean(fieldState.error)} errorMessage={fieldState.error?.message} />} />)}</StackRow>;
}
