import { type ComponentProps } from 'react';
import { TextInput } from '../../../../components/form';
import { formatProductMoney, parseProductMoneyInput } from '../utils/product-spu-currency.utils';

type ProductSpuMoneyInputProps = Omit<ComponentProps<typeof TextInput>, 'type' | 'value' | 'onChange'> & {
  value: string | number | null | undefined;
  onChange: (rawDigits: string) => void;
};
export const ProductSpuMoneyInput = ({ value, onChange, ...props }: ProductSpuMoneyInputProps) => (
  <TextInput {...props} type="text" inputMode="numeric" value={formatProductMoney(value)} onChange={(event) => onChange(parseProductMoneyInput(event.target.value))} />
);
