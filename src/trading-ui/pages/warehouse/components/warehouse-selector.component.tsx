import { Autocomplete, type SxProps, type Theme } from '@mui/material';
import useSWR from 'swr';
import { getPosStoreList } from '../../../apis/pos/pos.api';
import type { PosStore } from '../../../apis/pos/pos.entities';
import { TextInput } from '../../../components/form';

const WAREHOUSE_OPTIONS_SWR_KEY = ['warehouse-options', 'pos-store'] as const;
const WAREHOUSE_OPTIONS_QUERY = { page: 1, take: 200 };

export function useWarehouseOptions() {
  const { data, isValidating: isLoading } = useSWR(WAREHOUSE_OPTIONS_SWR_KEY, () => getPosStoreList(WAREHOUSE_OPTIONS_QUERY), {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
  return { options: data?.list ?? [], isLoading };
}

interface WarehouseSelectorProps {
  value: string;
  onChange: (warehouseId: string) => void;
  /** Text shown in the empty option when the list is loaded. */
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  /** Pre-fetched options — pass from useWarehouseOptions() to share one fetch across multiple selectors. */
  options?: PosStore[];
  isLoading?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export function WarehouseSelector({
  value,
  onChange,
  placeholder = 'Chọn kho',
  label,
  disabled,
  size = 'small',
  sx,
  options: externalOptions,
  isLoading: externalLoading,
  error,
  errorMessage,
}: WarehouseSelectorProps) {
  const internal = useWarehouseOptions();
  const options = externalOptions ?? internal.options;
  const loading = externalLoading ?? internal.isLoading;

  const selectedOption = options.find((w) => w.id === value) || null;

  return (
    <Autocomplete
      size={size}
      options={options}
      getOptionLabel={(option) => `${option.name} (${option.code})`}
      value={selectedOption}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue.id : '');
      }}
      disabled={disabled || loading}
      loading={loading}
      loadingText="Đang tải…"
      noOptionsText="Không có dữ liệu"
      sx={{ width: '100%', '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' }, ...sx }}
      renderInput={(params) => <TextInput {...params} label={label} placeholder={selectedOption ? '' : placeholder} error={error} errorMessage={errorMessage} />}
      ListboxProps={{ style: { maxHeight: 280 } }}
    />
  );
}
